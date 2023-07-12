/**
 *  AStar
 *
 *  Created by Paul Armstrong on 2011-05-26.
 *  Copyright (c) 2011 Paul Armstrong Designs. All rights reserved.
 *
 *  Based on: https://gist.github.com/827899
 */

ig.module('plugins.a-star')
.requires(
    'impact.game'
)
.defines(function () {

    PathFinderNode = function (pos, parent) {
        var tileSize = ig.game.collisionMap.tilesize;
        this.x = Math.floor(pos.x);
        this.y = Math.floor(pos.y);
        this.parent = parent;
        this.g = -1;
        this.h = -1;
        this.f = -1;
        this.hash = this.x + ',' + this.y;
        this.closed = false;
    };

    PathMapNode = function (x, y, v) {
        this.x = x;
        this.y = y;
        this.v = v;
    };

    PathFinder = ig.Class.extend({

        start: null,
        end: null,

        board: null,
        columns: null,
        rows: null,

        init: function (startEnt, endEnt, settings) {
            this.columns = ig.game.collisionMap.width;
            this.rows = ig.game.collisionMap.height;
            this.tilesize = ig.game.collisionMap.tilesize;

            this.start = new PathFinderNode({
                x: (startEnt.pos.x / this.tilesize),
                y: (startEnt.pos.y / this.tilesize)
            }, -1);
            this.end = new PathFinderNode({
                x: ((endEnt.pos.x + endEnt.size.x / 2) / this.tilesize),
                y: ((endEnt.pos.y + endEnt.size.y / 2) / this.tilesize)
            }, -1);

            this.board = this.getBoard(startEnt.size.x / 2);
            // for (var i = 0; i < this.board.length; i++) {
            //     console.log(this.board[i]);
            // }

            ig.merge(this, settings);
        },

        getBoard: function (radius) {
            var map = ig.game.collisionMap.data,
                board = [],
                tboard = map,
                c = this.columns,
                r = this.rows,
                s = Math.ceil(radius / this.tilesize),
                j = r, k = c,
                node, neighbors, n, l, m;

            while (s--) {
                j = r;
                board = [];
                while (j--) {
                    k = c;
                    board.unshift([]);
                    while (k--) {
                        v = tboard[j][k];
                        node = new PathMapNode(k, j);
                        neighbors = this.getNodeNeighbors(node);
                        l = neighbors.length;
                        board[0][k] = v;
                        while (l--) {
                            n = neighbors[l];
                            if (tboard[n.y][n.x]) {
                                board[0][k] = 1;
                                continue;
                            }
                        }
                    }
                }
                tboard = board;
            }

            return board;
        },

        getPath: function () {
            var nodes = {},         //Map of nodes hashed by node.hash
                open = [],          //List of open nodes (nodes to be inspected)
                closed = [],        //List of closed nodes (nodes we've already inspected)
                g = 0,              //Cost from start to current node
                h = this.getHeuristic(this.start, this.end), //Cost from current node to destination
                f = g + h,          //Cost from start to destination going through the current node
                bestCost, bestNode,
                currentNode,
                nNodes, nNode, exNode,
                isEnd, fOpen,
                path, fPath = [],
                q;

            //Push the start node onto the list of open nodes
            open.push(this.start);
            nodes[this.start.hash] = this.start;
            nodes[this.end.hash] = this.end;

            //Keep going while there's nodes in our open list
            while (open.length > 0) {
                //Find the best open node (lowest f value)

                //Alternately, you could simply keep the open list sorted by f value lowest to highest,
                //in which case you always use the first node
                bestCost = open[0].f;
                bestNode = 0;
                q = 1;

                for (q; q < open.length; q++) {
                    if (open[q].f < bestCost) {
                        bestCost = open[q].f;
                        bestNode = q;
                    }
                }

                currentNode = open[bestNode];

                //Check if we've reached our destination
                if (currentNode.x === this.end.x && currentNode.y === this.end.y) {
                    path = [this.end]; //Initialize the path with the destination node

                    //Go up the chain to recreate the path
                    while (currentNode.parent !== -1) {
                        currentNode = closed[currentNode.parent];
                        path.unshift(currentNode);
                    }

                    q = path.length;
                    while (q--) {
                        fPath.unshift({
                            x: path[q].x * this.tilesize,
                            y: path[q].y * this.tilesize
                        });
                    }

                    return fPath;
                }

                //Remove the current node from our open list
                open.splice(bestNode, 1);

                //Push it onto the closed list
                closed.push(currentNode);
                currentNode.closed = true;

                //Expand our current node (look in all 8 directions)
                nNodes = this.getNodeNeighbors(currentNode);
                q = 0;
                for (q; q < nNodes.length; q++) {

                    nNode = nNodes[q];
                    isEnd = (this.end.x === nNode.x && this.end.y === nNode.y);

                    if (this.board[nNode.y][nNode.x] === 0 || isEnd) //or the new node is our destination
                    {
                        // Do we already know about this node?
                        fClose = false;
                        exNode = nodes[nNode.hash];
                        if (exNode) {
                            if (exNode.closed) {
                                continue;
                            } else {
                                // normally we would say this: fClose = true;
                                // but the destination is never in either list
                                fClose = !isEnd;
                            }
                        }

                        //If the node is in our open list, use it.  Also use it if it is the destination (which is never in either list)
                        if (!fClose || isEnd) {
                            ig.merge(nNode, {
                                parent: closed.length - 1,
                                g: currentNode.g + this.getHeuristic(currentNode, nNode),
                                h: this.getHeuristic(nNode, this.end)
                            });
                            nNode.f = nNode.g + nNode.h;

                            open.push(nNode);
                            nodes[nNode.hash] = nNode;
                        }
                    }
                }
            }

            return [];
        },

        getNodeNeighbors: function (node) {
            var nodes = [],
                x = Math.max(0, node.x - 1),
                xMax = Math.min(this.columns - 1, node.x + 1),
                y, yMax = Math.min(this.rows - 1, node.y + 1);

            for (x; x <= xMax; x++) {
                y = Math.max(0, node.y - 1);
                for (y; y <= yMax; y++) {
                    nodes.push(new PathFinderNode({ x: x, y: y }, -1));
                }
            }

            return nodes;
        },

        getHeuristic: function (start, end) {
            var x = start.x - end.x,
                y = start.y - end.y;

            // stepped route
            return Math.sqrt(x * x + y * y);
            // most direct route
            // return (x * x) + (y * y);
        }
    });
});