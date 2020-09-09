require("dotenv").config();
const fs = require("fs");
const glob = require("glob");
const texturePacker = require("free-tex-packer-core");

const files = glob.sync("./sprite/assets/*.png");
const images = [];

for (const path of files) {
    images.push({ path, contents: fs.readFileSync(path) });
}

texturePacker(images, {
    textureName: "texture",
    padding: 1,
    allowRotation: false,
    prependFolderName: false,
    removeFileExtension: true,
    packer: "MaxRectsPacker",
    packerMethod: "SmartArea",
    tinify: process.env.TINIFY !== undefined,
    tinifyKey: process.env.TINIFY,
    exporter: {
        fileExt: "ts",
        template: "./sprite/sprite.tpl",
    }
}, (files, err) => {
    if (err) {
        console.error(err);
        return;
    }
    for (const file of files) {
        fs.writeFileSync("./src/asset/" + file.name, file.buffer);
    }
});
