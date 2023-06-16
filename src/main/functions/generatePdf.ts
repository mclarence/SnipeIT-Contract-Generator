import { SnipeITAsset } from 'main/interfaces/SnipeITAsset';
import { SnipeITUser } from 'main/interfaces/SnipeITUser';
import path from 'path';

interface IArgs {
  user: SnipeITUser;
  assets: SnipeITAsset[];
  filePath: string;
  templatePath: string;
  templateDefinition: string;
}

export default async function GeneratePdf(event: any, args: IArgs) {
  try {
    const docx = require('docx');
    const {
      patchDocument,
    } = docx;
    const libre = require('libreoffice-convert');
    libre.convertAsync = require('util').promisify(libre.convert);
    const fs = require('fs');

    // import the user specfied javascript file
    const patches = require('../misc/patches');
    const patchesObj = patches.default(args);

    patchDocument(
      fs.readFileSync(path.resolve(args.templatePath)),
      {
        patches : {
          ...patchesObj
        }
      }
    )
      .then(async (doc: any) => {
        const pdfBuf = await libre.convertAsync(doc, '.pdf', undefined);
        fs.writeFileSync(path.resolve(args.filePath), pdfBuf);
        event.reply('finished-generating-pdf');
      })
      .catch((err: any) => {
        console.log(err);
        event.reply('error-generating-pdf', err);
      });
  } catch (err) {
    console.log(err);
    event.reply('error-generating-pdf', err);
  }
}
