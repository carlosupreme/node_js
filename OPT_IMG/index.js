import imagemin from "imagemin";
import imageminJpegtran from "imagemin-jpegtran";
import imageminPngquant from "imagemin-pngquant";
import imageminWebp from "imagemin-webp";
import fse from "fs-extra";

const dir = "src";
const destination = "output";

const optimizePhotos = async () => {
  try {
    const files = await fse.readdir(dir);

    for (const file of files) {
      console.log(`Optimizando ${file}...`);

      await fse.copyFile(`${dir}/${file}`, `${destination}/${file}`);

      await imagemin([`${destination}/${file}`], {
        destination,
        plugins: [
          imageminJpegtran({ quality: 10 }),
          imageminPngquant(),
          imageminWebp({ quality: 10 }),
        ],
      });

      console.log(`✅ ${file} optimizado`);
    }
  } catch (err) {
    console.warn(err);
  }
};

await optimizePhotos();
console.log(`Fotos de la carpeta ${dir} optimizados`);
