export const hatTypes = {
    '0': 'cap',
    '1': 'cap',
    '2': 'elongated',
    '3': 'cowboy',
    '4': 'cowboy',
    '5': 'cowboy',
    '6': 'cowboy',
    '7': 'elongated'
}

export const hatSizes = {
    'elongated': {
        position: {
            firstFrames: {
                x: -20,
                y: -14
            },
            secondFrames: {
                x: -20,
                y: 50
            },
            thirdFrames: {
                x: -20,
                y: 113
            },
            forthFrames: {
                x: -17,
                y: 182
            },
            fifthFrames: {
                x: -17,
                y: 244
            },
            sixthFrames: {
                x: -20,
                y: 308
            },
            seventhFrames: {
                x: -22,
                y: 372
            }
        },
        size: {
            x: 100,
            y: 55
        } 
    },
    'cowboy': {
        position: {
            firstFrames: {
                x: -6,
                y: -20
            },
            secondFrames: {
                x: -6,
                y: 44
            },
            thirdFrames: {
                x: -6,
                y: 108
            },
            forthFrames: {
                '4': {
                    x: -2,
                    y: 170
                },
                x: -4,
                y: 172
            },
            fifthFrames: {
                x: -4,
                y: 236
            },
            sixthFrames: {
                x: -5,
                y: 300
            },
            seventhFrames: {
                x: -5,
                y: 364
            }
        },
        size: {
            x: 70,
            y: 70
        } 
    },
    'cap': {
        position: {
            firstFrames: {
                x: 4,
                y: -22
            },
            secondFrames: {
                x: 1,
                y: 42
            },
            thirdFrames: {
                x: 3,
                y: 104
            },
            forthFrames: {
                x: 10,
                y: 174.5
            },
            fifthFrames: {
                x: 8,
                y: 238.5
            },
            sixthFrames: {
                x: 3,
                y: 300
            },
            seventhFrames: {
                x: 3,
                y: 362
            }
        },
        size: {
            x: 60,
            y: 60
        } 
    },
}