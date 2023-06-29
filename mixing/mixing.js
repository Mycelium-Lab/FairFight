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
import { movementInTimeFirstFrames, movementInTimeThirdFrames } from './frames/movementIntTime.js';
import { bootsSizes, bootsTypes } from './sizes/boots/sizes.js';
import path from 'path'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __basedir = __dirname.slice(0, __dirname.length - 7)

export const createMixingPicture = async (address, chainid, characterId, armorId, bootsId, weaponId) => {
    // Создание нового холста с указанными размерами
    const canvas = createCanvas(768, 448);
    const ctx = canvas.getContext('2d');

    const canvasRival = createCanvas(768, 448)
    const ctxRival = canvasRival.getContext('2d');

    // Загрузка изображений персонажа и оружия
    const personImage = await loadImage(`${__dirname}/basic_images/characters_main/${characterId}.png`);
    const personRivalImage = await loadImage(`${__dirname}/basic_images/characters_rival/${characterId}.png`);
    let weaponImage
    let hatImage
    let _hatType
    let _hatSize
    let _hatNumber
    let bootsImage
    let _bootsType
    let _bootsSize
    if (!isNaN(parseInt(weaponId))) {
        // const weaponImage = await loadImage('weapon.png');
    }
    if (!isNaN(parseInt(armorId))) {
        hatImage = await loadImage(`${__dirname}/basic_images/armors/${armorId}.png`);
        const hatArmorPrefixIndex = hatImage.src.indexOf('armors/')
        const hatArmorSuffixIndex = hatImage.src.indexOf('.png')
        _hatNumber = hatImage.src.slice(hatArmorPrefixIndex + 7, hatArmorSuffixIndex)
        _hatType = hatTypes[`${_hatNumber}`]
        _hatSize = hatSizes[`${_hatType}`]
    }
    if (!isNaN(parseInt(bootsId))) {
        bootsImage = await loadImage(`${__dirname}/basic_images/boots/${bootsId}.png`);
        const bootsPrefixIndex = bootsImage.src.indexOf('boots/')
        const bootsSuffixIndex = bootsImage.src.indexOf('.png')
        const _bootsNumber = bootsImage.src.slice(bootsPrefixIndex + 6, bootsSuffixIndex)
        _bootsType = bootsTypes[`${_bootsNumber}`]
        _bootsSize = bootsSizes[`${_bootsType}`]
    }
    const weaponWidth = 30
    const weaponHeight = 30

    function draw(_ctx, _canvas, type, image) {
        // Наложение персонажа на холст
        _ctx.drawImage(image, 0, 0);

        _ctx.imageSmoothingEnabled = false;
        for (let i = 0; i < 12; i++) {
            if (!isNaN(parseInt(armorId))) {
                _ctx.drawImage(hatImage, _hatSize.position.firstFrames.x + (i * 64), _hatSize.position.firstFrames.y + movementInTimeFirstFrames[i], _hatSize.size.x, _hatSize.size.y);        
            }
            if (!isNaN(parseInt(bootsId))) {
                _ctx.drawImage(bootsImage, _bootsSize.position.firstFrames.left.x + (i * 64), _bootsSize.position.firstFrames.left.y, _bootsSize.size.x, _bootsSize.size.y);
                _ctx.drawImage(bootsImage, _bootsSize.position.firstFrames.right.x + (i * 64), _bootsSize.position.firstFrames.right.y, _bootsSize.size.x, _bootsSize.size.y);
            }
            if (!isNaN(parseInt(weaponId))) {
                // _ctx.drawImage(weaponImage, 48 + (i * 64), 28,weaponWidth,weaponHeight);
            }
        }
        for (let i = 0; i < 4; i++) {
            let add = 95
            if (i === 3) add = 96
            if (!isNaN(parseInt(weaponId))) {
                // _ctx.drawImage(weaponImage, 54 + (i * add), 86,weaponWidth,weaponHeight);
            }
            if (!isNaN(parseInt(armorId))) {
                _ctx.drawImage(hatImage, _hatSize.position.secondFrames.x + (i * add), _hatSize.position.secondFrames.y, _hatSize.size.x, _hatSize.size.y);
            }
            if (!isNaN(parseInt(bootsId))) {
                _ctx.drawImage(bootsImage, _bootsSize.position.secondFrames.left.x + (i * 96), _bootsSize.position.secondFrames.left.y, _bootsSize.size.x, _bootsSize.size.y);
                _ctx.drawImage(bootsImage, _bootsSize.position.secondFrames.right.x + (i * 96), _bootsSize.position.secondFrames.right.y, _bootsSize.size.x, _bootsSize.size.y);
            }
        }
        // //3й ряд
        for (let i = 0; i < thirdFramesX.length; i++) {
            if (!isNaN(parseInt(weaponId))) {
                // _ctx.drawImage(weaponImage, thirdFramesX[i].weapon, thirdFramesY[i].weapon,weaponWidth,weaponHeight);
            }
            if (!isNaN(parseInt(armorId))) {
                _ctx.drawImage(hatImage, _hatSize.position.thirdFrames.x + (i * 64), _hatSize.position.thirdFrames.y + movementInTimeThirdFrames[i], _hatSize.size.x, _hatSize.size.y);
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
        }
        // //4й ряд
        for (let i = 0; i < forthFramesX.length; i++) {
            if (!isNaN(parseInt(armorId))) {
                const __hatSizePosition = _hatSize.position.forthFrames[`${_hatNumber}`] ? _hatSize.position.forthFrames[`${_hatNumber}`] : _hatSize.position.forthFrames
                let angleInRadians = 20 * Math.PI / 180;
                _ctx.save();
                _ctx.translate(__hatSizePosition.x + (i * 64) + _hatSize.size.x / 2, __hatSizePosition.y + _hatSize.size.y / 2);
                _ctx.rotate(angleInRadians);
                _ctx.drawImage(hatImage, -_hatSize.size.x / 2, -_hatSize.size.y / 2, _hatSize.size.x, _hatSize.size.y);
                _ctx.restore();
            }
            if (!isNaN(parseInt(weaponId))) {
                console.log(`id`, weaponId)
                _ctx.drawImage(weaponImage, forthFramesX[i].weapon, forthFramesY[i].weapon,weaponWidth,weaponHeight);
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
        }
        // //5й ряд
        for (let i = 0; i < fifthFramesX.length; i++) {
            if (!isNaN(parseInt(armorId))) {
                const __hatSizePosition = _hatSize.position.fifthFrames[`${_hatNumber}`] ? _hatSize.position.fifthFrames[`${_hatNumber}`] : _hatSize.position.fifthFrames
                let angleInRadians = 13 * Math.PI / 180;
                _ctx.save();
                _ctx.translate(__hatSizePosition.x + (i * (94 + i/2)) + _hatSize.size.x / 2, __hatSizePosition.y + _hatSize.size.y / 2);
                _ctx.rotate(angleInRadians);
                _ctx.drawImage(hatImage, -_hatSize.size.x / 2, -_hatSize.size.y / 2, _hatSize.size.x, _hatSize.size.y);
                _ctx.restore();
            }
            if (!isNaN(parseInt(weaponId))) {
                _ctx.drawImage(weaponImage, forthFramesX[i].weapon, forthFramesY[i].weapon,weaponWidth,weaponHeight);
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
        }
        // //6й ряд
        for (let i = 0; i < sixthFramesX.length; i++) {
            if (!isNaN(parseInt(weaponId))) {
                _ctx.drawImage(weaponImage, sixthFramesX[i].weapon, sixthFramesY[i].weapon,weaponWidth,weaponHeight);
            }
            if (!isNaN(parseInt(armorId))) {
                _ctx.drawImage(hatImage, _hatSize.position.sixthFrames.x + (i * 64), _hatSize.position.sixthFrames.y, _hatSize.size.x, _hatSize.size.y);
            }
        }
        if (!isNaN(parseInt(bootsId))) {
            _ctx.drawImage(bootsImage, _bootsSize.position.sixthFrames.left.x, _bootsSize.position.sixthFrames.left.y, _bootsSize.size.x, _bootsSize.size.y);
            _ctx.drawImage(bootsImage, _bootsSize.position.sixthFrames.right.x, _bootsSize.position.sixthFrames.right.y, _bootsSize.size.x, _bootsSize.size.y);    
        }
        //7й ряд
        for (let i = 0; i < seventhFramesX.length; i++) {
            if (!isNaN(parseInt(weaponId))) {
                _ctx.drawImage(weaponImage, seventhFramesX[i].weapon, seventhFramesY[i].weapon,weaponWidth,weaponHeight);
            }
            if (!isNaN(parseInt(armorId))) {
                _ctx.drawImage(hatImage, _hatSize.position.seventhFrames.x + (i * 64), _hatSize.position.seventhFrames.y, _hatSize.size.x, _hatSize.size.y);
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
        // Запись объединенного изображения в файл
        const out = fs.createWriteStream(`${__basedir}/media/characters/${type}/${address}_${chainid}.png`);
        const stream = _canvas.createPNGStream();
        stream.pipe(out);
    }

    draw(ctx, canvas, 'main', personImage)
    draw(ctxRival, canvasRival, 'rival', personRivalImage)
}
