import { createCanvas, loadImage } from 'canvas'
import fs from 'fs'
import { thirdFramesX } from './frames/x/third.js';
import { thirdFramesY } from './frames/y/third.js';
import { forthFramesX } from './frames/x/forth.js';
import { forthFramesY } from './frames/y/forth.js';
import { fifthFramesX } from './frames/x/fifth.js';
import { fifthFramesY } from './frames/y/fifth.js';
import { sixthFramesX } from './frames/x/sixth.js';
import { sixthFramesY } from './frames/y/sixth.js';
import { seventhFramesX } from './frames/x/seventh.js';
import { seventhFramesY } from './frames/y/seventh.js';
import { hatSizes, hatTypes } from './sizes/hat/sizes.js';
import { movementInTimeFifthFrames, movementInTimeFirstFrames, movementInTimeFirstFramesWeapons, movementInTimeForthFrames, movementInTimeSecondFramesMachineWeapon, movementInTimeThirdFrames } from './frames/movementIntTime.js';
import { bootsSizes, bootsTypes } from './sizes/boots/sizes.js';
import path from 'path'
import { fileURLToPath } from 'url';
import { weaponSizes, weaponTypes } from './sizes/weapons/sizes.js';
import { charactersLegsPlusX } from './frames/charactersLegs.js';
import { charactersHats } from './frames/charactersHats.js';
import { longWeapon } from './frames/longWeapon.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __basedir = __dirname.slice(0, __dirname.length - 7)

/* 
    @param isTryOn - means it's not full change of person image
*/
export const createMixingPicture = async (address, chainid, characterId, armorId, bootsId, weaponId, isTryOn) => {
    // Создание нового холста с указанными размерами
    const canvas = createCanvas(1826, 1060);
    const ctx = canvas.getContext('2d');

    const canvasRival = createCanvas(1826, 1060)
    const ctxRival = canvasRival.getContext('2d');

    const canvasPreview = createCanvas(5478, 3180)
    const ctxPreview = canvasPreview.getContext('2d');

    // Загрузка изображений персонажа и оружия
    const personImage = await loadImage(`${__dirname}/basic_images/characters_main/${characterId}.png`);
    const personRivalImage = await loadImage(`${__dirname}/basic_images/characters_rival/${characterId}.png`);
    const personPreviewImage = await loadImage(`${__dirname}/basic_images/characters_preview/${characterId}.png`)
    let weaponImage
    let _weaponType
    let _weaponSize
    let _weaponNumber
    let hatImage
    let _hatType
    let _hatSize
    let _hatNumber = armorId
    let bootsImage
    let _bootsType
    let _bootsSize
    if (!isNaN(parseInt(weaponId))) {
        weaponImage = await loadImage(`${__dirname}/basic_images/weapons/${weaponId}.png`);
        _weaponType = weaponTypes[`${weaponId}`]
        _weaponSize = JSON.parse(JSON.stringify(weaponSizes[`${_weaponType}`]));
        if (_weaponSize.size[`${weaponId}`]) {
            _weaponSize.size.x = _weaponSize.size[`${weaponId}`].x
            _weaponSize.size.y = _weaponSize.size[`${weaponId}`].y
        }
        if (_weaponSize.position.secondFrames[`id-${weaponId}`]) {
            _weaponSize.position.secondFrames = _weaponSize.position.secondFrames[`id-${weaponId}`]
        }
        _weaponSize.size.x = _weaponSize.size.x - (longWeapon[`${weaponId}`] ? longWeapon[`${weaponId}`].x : 0)
        _weaponSize.size.y = _weaponSize.size.y - (longWeapon[`${weaponId}`] ? longWeapon[`${weaponId}`].y : 0)
    }
    if (!isNaN(parseInt(armorId))) {
        hatImage = await loadImage(`${__dirname}/basic_images/armors/${armorId}.png`);
        _hatType = hatTypes[`${_hatNumber}`]
        _hatSize = JSON.parse(JSON.stringify(hatSizes[`${_hatType}`]))
        if (charactersHats[`${characterId}`] && charactersHats[`${characterId}`][`${armorId}`]) {
            _hatSize.position.firstFrames.x += charactersHats[`${characterId}`][`${armorId}`].x
            _hatSize.position.firstFrames.y += charactersHats[`${characterId}`][`${armorId}`].y

            _hatSize.position.secondFrames.x += charactersHats[`${characterId}`][`${armorId}`].x
            _hatSize.position.secondFrames.y += charactersHats[`${characterId}`][`${armorId}`].y
            
            _hatSize.position.thirdFrames.x += charactersHats[`${characterId}`][`${armorId}`].x
            _hatSize.position.thirdFrames.y += charactersHats[`${characterId}`][`${armorId}`].y
            
            _hatSize.position.forthFrames.x += charactersHats[`${characterId}`][`${armorId}`].x
            _hatSize.position.forthFrames.y += charactersHats[`${characterId}`][`${armorId}`].y
            
            _hatSize.position.fifthFrames.x += charactersHats[`${characterId}`][`${armorId}`].x
            _hatSize.position.fifthFrames.y += charactersHats[`${characterId}`][`${armorId}`].y
            
        }
    }
    if (!isNaN(parseInt(bootsId))) {
        bootsImage = await loadImage(`${__dirname}/basic_images/boots/${bootsId}.png`);
        _bootsType = bootsTypes[`${bootsId}`]
        _bootsSize = JSON.parse(JSON.stringify(bootsSizes[`${_bootsType}`]))
        if (charactersLegsPlusX[`${characterId}`]) {
            _bootsSize.position.firstFrames.left.x += charactersLegsPlusX[`${characterId}`].left
            _bootsSize.position.firstFrames.right.x += charactersLegsPlusX[`${characterId}`].right
    
            _bootsSize.position.secondFrames.left.x += charactersLegsPlusX[`${characterId}`].left
            _bootsSize.position.secondFrames.right.x += charactersLegsPlusX[`${characterId}`].right
            for (let i = 0; i <= 7; i++) {
                _bootsSize.position.thirdFrames[`${i}`].left.x += i === 3 ? 2 : charactersLegsPlusX[`${characterId}`].left
                _bootsSize.position.thirdFrames[`${i}`].right.x += i === 3 ? 2 : charactersLegsPlusX[`${characterId}`].right
            }
            for (let i = 0; i <= 4; i++) {
                _bootsSize.position.forthFrames[`${i}`].left.x += i === 4 ? 2 : charactersLegsPlusX[`${characterId}`].left
                _bootsSize.position.forthFrames[`${i}`].right.x += i === 4 ? 2 : charactersLegsPlusX[`${characterId}`].right    
            }
            for (let i = 0; i <= 4; i++) {
                _bootsSize.position.fifthFrames[`${i}`].left.x += i === 4 ? 2 : charactersLegsPlusX[`${characterId}`].left
                _bootsSize.position.fifthFrames[`${i}`].right.x += i === 4 ? 2 : charactersLegsPlusX[`${characterId}`].right
            }
            _bootsSize.position.sixthFrames.left.x += charactersLegsPlusX[`${characterId}`].left
            _bootsSize.position.sixthFrames.right.x += charactersLegsPlusX[`${characterId}`].right
    
            _bootsSize.position.seventhFrames.left.x += charactersLegsPlusX[`${characterId}`].left
            _bootsSize.position.seventhFrames.right.x += charactersLegsPlusX[`${characterId}`].right
        }
    }

    function draw(_ctx, _canvas, type, image) {
        const preview = image.naturalHeight === 3180
        // Наложение персонажа на холст
        _ctx.drawImage(image, 0, 0);

        _ctx.imageSmoothingEnabled = false;
        for (let i = 0; i < 12; i++) {
            if (!isNaN(parseInt(armorId))) {
                _ctx.drawImage(
                    hatImage, 
                    preview ? 
                    (_hatSize.position.firstFrames.preview.x + (charactersHats[`${characterId}`][`${armorId}`] ? charactersHats[`${characterId}`][`${armorId}`].preview.x : 0)) + (i * 456) 
                    : _hatSize.position.firstFrames.x + (i * 152), 
                    preview ? (_hatSize.position.firstFrames.preview.y + (charactersHats[`${characterId}`][`${armorId}`] ? charactersHats[`${characterId}`][`${armorId}`].preview.y : 0)) + (movementInTimeFirstFrames[i] * 3) : _hatSize.position.firstFrames.y + movementInTimeFirstFrames[i],
                    preview ? _hatSize.size.preview.x : _hatSize.size.x, 
                    preview ? _hatSize.size.preview.y : _hatSize.size.y
                );        
            }
            if (!isNaN(parseInt(bootsId))) {
                _ctx.drawImage(
                    bootsImage, 
                    preview ? (_bootsSize.position.firstFrames.right.preview.x + charactersLegsPlusX[`${characterId}`].preview.right) + (i * 456) : _bootsSize.position.firstFrames.right.x + (i * 152), 
                    preview ? _bootsSize.position.firstFrames.right.preview.y: _bootsSize.position.firstFrames.right.y, 
                    preview ? _bootsSize.size.preview.x : _bootsSize.size.x, 
                    preview ? _bootsSize.size.preview.y : _bootsSize.size.y
                );
                _ctx.drawImage(
                    bootsImage, 
                    preview ?  (_bootsSize.position.firstFrames.left.preview.x + charactersLegsPlusX[`${characterId}`].preview.left) + (i * 456) : _bootsSize.position.firstFrames.left.x + (i * 152), 
                    preview ?  _bootsSize.position.firstFrames.left.preview.y: _bootsSize.position.firstFrames.left.y, 
                    preview ? _bootsSize.size.preview.x : _bootsSize.size.x, 
                    preview ? _bootsSize.size.preview.y : _bootsSize.size.y
                );
            }
            if (!isNaN(parseInt(weaponId))) {
                _ctx.drawImage(
                    weaponImage, 
                    preview ? _weaponSize.position.firstFrames.preview.x + (i * 456):  _weaponSize.position.firstFrames.x + (i * 152), 
                    preview ? _weaponSize.position.firstFrames.preview.y + (movementInTimeFirstFramesWeapons[i] * 3) : _weaponSize.position.firstFrames.y + movementInTimeFirstFramesWeapons[i],
                    preview ? _weaponSize.size.preview.x : _weaponSize.size.x,
                    preview ? _weaponSize.size.preview.y : _weaponSize.size.y
                );
            }
        }
        if (!preview) {
            for (let i = 0; i < 4; i++) {
                let add = 151
                if (i === 3) add = 152
                if (!isNaN(parseInt(armorId))) {
                    _ctx.drawImage(hatImage, _hatSize.position.secondFrames.x + (i * add), _hatSize.position.secondFrames.y, _hatSize.size.x, _hatSize.size.y);
                }
                if (!isNaN(parseInt(bootsId))) {
                    _ctx.drawImage(bootsImage, _bootsSize.position.secondFrames.left.x + (i * 152), _bootsSize.position.secondFrames.left.y, _bootsSize.size.x, _bootsSize.size.y);
                    _ctx.drawImage(bootsImage, _bootsSize.position.secondFrames.right.x + (i * 152), _bootsSize.position.secondFrames.right.y, _bootsSize.size.x, _bootsSize.size.y);
                }
                if (!isNaN(parseInt(weaponId))) {
                  _ctx.drawImage(weaponImage, (_weaponSize.position.secondFrames.x + movementInTimeSecondFramesMachineWeapon[i]) + (i * 152), _weaponSize.position.secondFrames.y,_weaponSize.size.x,_weaponSize.size.y);
                }
            }
            // //3й ряд
            for (let i = 0; i < thirdFramesX.length; i++) {
                if (!isNaN(parseInt(armorId))) {
                    _ctx.drawImage(hatImage, _hatSize.position.thirdFrames.x + (i * 152), _hatSize.position.thirdFrames.y + movementInTimeThirdFrames[i], _hatSize.size.x, _hatSize.size.y);
                }
                if (!isNaN(parseInt(bootsId))) {
                    let angleLeft = 20
                    let angleRight = 20
                    if (i === 5) angleRight = -20
                    if (i === 6) angleLeft = 35, angleRight = -40
                    if (i === 7) angleLeft = 30, angleRight = -30
                    if (i === 2 || i === 5 || i === 6 || i === 7) {
                        let angleInRadiansLeft = angleLeft * Math.PI / 180;
                        let angleInRadiansRight = angleRight * Math.PI / 180;
                        _ctx.save(); // Сохраняем текущий контекст рисования
                        _ctx.translate(_bootsSize.position.thirdFrames[`${i}`].left.x + _bootsSize.size.x / 2, _bootsSize.position.thirdFrames[`${i}`].left.y + _bootsSize.size.y / 2);
                        _ctx.rotate(angleInRadiansLeft); // Поворачиваем контекст на 20 градусов
                        _ctx.drawImage(bootsImage, -_bootsSize.size.x / 2, -_bootsSize.size.y / 2, _bootsSize.size.x, _bootsSize.size.y);
                        _ctx.restore(); // Восстанавливаем предыдущий контекст рисования
                    
                        _ctx.save(); // Сохраняем текущий контекст рисования
                        _ctx.translate(_bootsSize.position.thirdFrames[`${i}`].right.x + _bootsSize.size.x / 2, _bootsSize.position.thirdFrames[`${i}`].right.y + _bootsSize.size.y / 2);
                        _ctx.rotate(angleInRadiansRight); // Поворачиваем контекст на 20 градусов
                        _ctx.drawImage(bootsImage, -_bootsSize.size.x / 2, -_bootsSize.size.y / 2, _bootsSize.size.x, _bootsSize.size.y);
                        _ctx.restore(); // Восстанавливаем предыдущий контекст рисования
                    } else {
                        _ctx.drawImage(bootsImage, _bootsSize.position.thirdFrames[`${i}`].left.x, _bootsSize.position.thirdFrames[`${i}`].left.y, _bootsSize.size.x, _bootsSize.size.y);
                        _ctx.drawImage(bootsImage, _bootsSize.position.thirdFrames[`${i}`].right.x, _bootsSize.position.thirdFrames[`${i}`].right.y, _bootsSize.size.x, _bootsSize.size.y);
                    }
                }
                if (!isNaN(parseInt(weaponId))) {
                  if (!isNaN(parseInt(_weaponSize.position.thirdFrames[`${i}`].angle))) {
                    let angleInRadians = _weaponSize.position.thirdFrames[`${i}`].angle * Math.PI / 180;
                    _ctx.save(); // Сохраняем текущий контекст рисования
                    _ctx.translate(_weaponSize.position.thirdFrames[`${i}`].x + _weaponSize.size.x / 2, _weaponSize.position.thirdFrames[`${i}`].y + _weaponSize.size.y / 2);
                    _ctx.rotate(angleInRadians); // Поворачиваем контекст
                    _ctx.drawImage(weaponImage, -_weaponSize.size.x / 2, -_weaponSize.size.y / 2, _weaponSize.size.x, _weaponSize.size.y);
                    _ctx.restore(); // Восстанавливаем предыдущий контекст рисования
                  } else {
                    _ctx.drawImage(weaponImage, _weaponSize.position.thirdFrames[`${i}`].x, _weaponSize.position.thirdFrames[`${i}`].y,_weaponSize.size.x,_weaponSize.size.y);
                  }
                }
            }
            // //4й ряд
            for (let i = 0; i < forthFramesX.length; i++) {
                if (!isNaN(parseInt(armorId))) {
                    const __hatSizePosition = _hatSize.position.forthFrames[`${_hatNumber}`] ? _hatSize.position.forthFrames[`${_hatNumber}`] : _hatSize.position.forthFrames
                    let angleInRadians = 20 * Math.PI / 180;
                    _ctx.save();
                    _ctx.translate(__hatSizePosition.x + (i * 152) + _hatSize.size.x / 2, (__hatSizePosition.y + movementInTimeForthFrames[i]) + _hatSize.size.y / 2);
                    _ctx.rotate(angleInRadians);
                    _ctx.drawImage(hatImage, -_hatSize.size.x / 2, -_hatSize.size.y / 2, _hatSize.size.x, _hatSize.size.y);
                    _ctx.restore();
                }
                if (!isNaN(parseInt(bootsId))) {
                    let angleLeft = 10
                    let angleRight = 10
                    if (i === 4) angleLeft = 30, angleRight = -30
                    if (i !== 0) {
                        let angleInRadiansLeft = angleLeft * Math.PI / 180;
                        let angleInRadiansRight = angleRight * Math.PI / 180;
                        _ctx.save(); // Сохраняем текущий контекст рисования
                        _ctx.translate(_bootsSize.position.forthFrames[`${i}`].left.x + _bootsSize.size.x / 2, _bootsSize.position.forthFrames[`${i}`].left.y + _bootsSize.size.y / 2);
                        _ctx.rotate(angleInRadiansLeft); // Поворачиваем контекст на 20 градусов
                        if (i === 4) _ctx.scale(-1, 1);
                        _ctx.drawImage(bootsImage, -_bootsSize.size.x / 2, -_bootsSize.size.y / 2, _bootsSize.size.x, _bootsSize.size.y);
                        _ctx.restore(); // Восстанавливаем предыдущий контекст рисования
                    
                        _ctx.save(); // Сохраняем текущий контекст рисования
                        _ctx.translate(_bootsSize.position.forthFrames[`${i}`].right.x + _bootsSize.size.x / 2, _bootsSize.position.forthFrames[`${i}`].right.y + _bootsSize.size.y / 2);
                        _ctx.rotate(angleInRadiansRight); // Поворачиваем контекст на 20 градусов
                        _ctx.drawImage(bootsImage, -_bootsSize.size.x / 2, -_bootsSize.size.y / 2, _bootsSize.size.x, _bootsSize.size.y);
                        _ctx.restore(); // Восстанавливаем предыдущий контекст рисования
                    } else {
                        _ctx.drawImage(bootsImage, _bootsSize.position.forthFrames[`${i}`].left.x, _bootsSize.position.forthFrames[`${i}`].left.y, _bootsSize.size.x, _bootsSize.size.y);
                        _ctx.drawImage(bootsImage, _bootsSize.position.forthFrames[`${i}`].right.x, _bootsSize.position.forthFrames[`${i}`].right.y, _bootsSize.size.x, _bootsSize.size.y);
                    }
                }
                if (!isNaN(parseInt(weaponId))) {
                    if (!isNaN(parseInt(_weaponSize.position.forthFrames[`${i}`].angle))) {
                      let angleInRadians = _weaponSize.position.forthFrames[`${i}`].angle * Math.PI / 180;
                      _ctx.save(); // Сохраняем текущий контекст рисования
                      _ctx.translate(_weaponSize.position.forthFrames[`${i}`].x + _weaponSize.size.x / 2, _weaponSize.position.forthFrames[`${i}`].y + _weaponSize.size.y / 2);
                      _ctx.rotate(angleInRadians); // Поворачиваем контекст
                      _ctx.drawImage(weaponImage, -_weaponSize.size.x / 2, -_weaponSize.size.y / 2, _weaponSize.size.x, _weaponSize.size.y);
                      _ctx.restore(); // Восстанавливаем предыдущий контекст рисования
                    } else {
                      _ctx.drawImage(weaponImage, _weaponSize.position.forthFrames[`${i}`].x, _weaponSize.position.forthFrames[`${i}`].y,_weaponSize.size.x,_weaponSize.size.y);
                    }
                }
            }
            // //5й ряд
            for (let i = 0; i < fifthFramesX.length; i++) {
                if (!isNaN(parseInt(armorId))) {
                    const __hatSizePosition = _hatSize.position.fifthFrames[`${_hatNumber}`] ? _hatSize.position.fifthFrames[`${_hatNumber}`] : _hatSize.position.fifthFrames
                    let angleInRadians = 8 * Math.PI / 180;
                    _ctx.save();
                    _ctx.translate(__hatSizePosition.x + (i * (150.5 + i/2)) + _hatSize.size.x / 2, (__hatSizePosition.y + movementInTimeFifthFrames[i]) + _hatSize.size.y / 2);
                    _ctx.rotate(angleInRadians);
                    _ctx.drawImage(hatImage, -_hatSize.size.x / 2, -_hatSize.size.y / 2, _hatSize.size.x, _hatSize.size.y);
                    _ctx.restore();
                }
                if (!isNaN(parseInt(bootsId))) {
                    let angleLeft = 10
                    let angleRight = 10
                    if (i === 4) angleLeft = 30, angleRight = -30
                    if (i !== 0) {
                        let angleInRadiansLeft = angleLeft * Math.PI / 180;
                        let angleInRadiansRight = angleRight * Math.PI / 180;
                        _ctx.save(); // Сохраняем текущий контекст рисования
                        _ctx.translate(_bootsSize.position.fifthFrames[`${i}`].left.x + _bootsSize.size.x / 2, _bootsSize.position.fifthFrames[`${i}`].left.y + _bootsSize.size.y / 2);
                        _ctx.rotate(angleInRadiansLeft); // Поворачиваем контекст на 20 градусов
                        if (i === 4) _ctx.scale(-1, 1);
                        _ctx.drawImage(bootsImage, -_bootsSize.size.x / 2, -_bootsSize.size.y / 2, _bootsSize.size.x, _bootsSize.size.y);
                        _ctx.restore(); // Восстанавливаем предыдущий контекст рисования
                    
                        _ctx.save(); // Сохраняем текущий контекст рисования
                        _ctx.translate(_bootsSize.position.fifthFrames[`${i}`].right.x + _bootsSize.size.x / 2, _bootsSize.position.fifthFrames[`${i}`].right.y + _bootsSize.size.y / 2);
                        _ctx.rotate(angleInRadiansRight); // Поворачиваем контекст на 20 градусов
                        _ctx.drawImage(bootsImage, -_bootsSize.size.x / 2, -_bootsSize.size.y / 2, _bootsSize.size.x, _bootsSize.size.y);
                        _ctx.restore(); // Восстанавливаем предыдущий контекст рисования
                    } else {
                        _ctx.drawImage(bootsImage, _bootsSize.position.fifthFrames[`${i}`].left.x, _bootsSize.position.fifthFrames[`${i}`].left.y, _bootsSize.size.x, _bootsSize.size.y);
                        _ctx.drawImage(bootsImage, _bootsSize.position.fifthFrames[`${i}`].right.x, _bootsSize.position.fifthFrames[`${i}`].right.y, _bootsSize.size.x, _bootsSize.size.y);
                    }
                }
                if (!isNaN(parseInt(weaponId))) {
                    if (!isNaN(parseInt(_weaponSize.position.fifthFrames[`${i}`].angle))) {
                      let angleInRadians = _weaponSize.position.fifthFrames[`${i}`].angle * Math.PI / 180;
                      _ctx.save(); // Сохраняем текущий контекст рисования
                      _ctx.translate(_weaponSize.position.fifthFrames[`${i}`].x + _weaponSize.size.x / 2, _weaponSize.position.fifthFrames[`${i}`].y + _weaponSize.size.y / 2);
                      _ctx.rotate(angleInRadians); // Поворачиваем контекст
                      _ctx.drawImage(weaponImage, -_weaponSize.size.x / 2, -_weaponSize.size.y / 2, _weaponSize.size.x, _weaponSize.size.y);
                      _ctx.restore(); // Восстанавливаем предыдущий контекст рисования
                    } else {
                      _ctx.drawImage(weaponImage, _weaponSize.position.fifthFrames[`${i}`].x, _weaponSize.position.fifthFrames[`${i}`].y,_weaponSize.size.x,_weaponSize.size.y);
                    }
                }
            }
            // //6й ряд
            for (let i = 0; i < sixthFramesX.length; i++) {
                // if (!isNaN(parseInt(weaponId))) {
                // }
                if (!isNaN(parseInt(armorId))) {
                    _ctx.drawImage(hatImage, _hatSize.position.sixthFrames.x + (i * 152), _hatSize.position.sixthFrames.y, _hatSize.size.x, _hatSize.size.y);
                }
            }
            if (!isNaN(parseInt(bootsId))) {
                _ctx.drawImage(bootsImage, _bootsSize.position.sixthFrames.left.x, _bootsSize.position.sixthFrames.left.y, _bootsSize.size.x, _bootsSize.size.y);
                _ctx.drawImage(bootsImage, _bootsSize.position.sixthFrames.right.x, _bootsSize.position.sixthFrames.right.y, _bootsSize.size.x, _bootsSize.size.y);    
            }
            if (!isNaN(parseInt(weaponId))) {
                _ctx.drawImage(weaponImage, _weaponSize.position.sixthFrames.x, _weaponSize.position.sixthFrames.y, _weaponSize.size.x, _weaponSize.size.y);
            }
            //7й ряд
            for (let i = 0; i < seventhFramesX.length; i++) {
                // if (!isNaN(parseInt(weaponId))) {
                //     _ctx.drawImage(weaponImage, seventhFramesX[i].weapon, seventhFramesY[i].weapon,weaponWidth,weaponHeight);
                // }
                if (!isNaN(parseInt(armorId))) {
                    _ctx.drawImage(hatImage, _hatSize.position.seventhFrames.x + (i * 152), _hatSize.position.seventhFrames.y, _hatSize.size.x, _hatSize.size.y);
                }
            }
            if (!isNaN(parseInt(bootsId))) {
                let angleInRadiansLeft = 20 * Math.PI / 180;
                let angleInRadiansRight = -20 * Math.PI / 180;
                _ctx.save(); // Сохраняем текущий контекст рисования
                _ctx.translate(_bootsSize.position.seventhFrames.left.x + _bootsSize.size.x / 2, _bootsSize.position.seventhFrames.left.y + _bootsSize.size.y / 2);
                _ctx.rotate(angleInRadiansLeft); // Поворачиваем контекст на 20 градусов
                _ctx.scale(-1, 1);
                _ctx.drawImage(bootsImage, -_bootsSize.size.x / 2, -_bootsSize.size.y / 2, _bootsSize.size.x, _bootsSize.size.y);
                _ctx.restore(); // Восстанавливаем предыдущий контекст рисования
            
                _ctx.save(); // Сохраняем текущий контекст рисования
                _ctx.translate(_bootsSize.position.seventhFrames.right.x + _bootsSize.size.x / 2, _bootsSize.position.seventhFrames.right.y + _bootsSize.size.y / 2);
                _ctx.rotate(angleInRadiansRight); // Поворачиваем контекст на 20 градусов
                _ctx.drawImage(bootsImage, -_bootsSize.size.x / 2, -_bootsSize.size.y / 2, _bootsSize.size.x, _bootsSize.size.y);
                _ctx.restore(); // Восстанавливаем предыдущий контекст рисования    
            }
            if (!isNaN(parseInt(weaponId))) {
                _ctx.drawImage(weaponImage, _weaponSize.position.seventhFrames.x, _weaponSize.position.seventhFrames.y, _weaponSize.size.x, _weaponSize.size.y);
            }
        }
        // Запись объединенного изображения в файл
        let filePath = `${__basedir}/media/characters/players_${type}/${address}_${chainid}.png`
        if (isTryOn) {
            filePath = `${__basedir}/media/characters/tryon/${address}_${chainid}.png`
        } 
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (!err) {
                const out = fs.createWriteStream(filePath);
                const stream = _canvas.createPNGStream();
                stream.pipe(out);
            } else {
                // Создание пустого файла
                fs.writeFile(filePath, '', (err) => {
                  if (err) {
                    console.error('Ошибка при создании файла:', err);
                  } else {
                    const out = fs.createWriteStream(filePath);
                    const stream = _canvas.createPNGStream();
                    stream.pipe(out);
                  }
                });
            }
          });
    }

    try {
        draw(ctxPreview, canvasPreview, 'preview', personPreviewImage)
        if (!isTryOn) { 
            draw(ctx, canvas, 'main', personImage)
            draw(ctxRival, canvasRival, 'rival', personRivalImage) 
        }
    } catch (error) {
        console.log(error)
    }
}
