import { SnipeITAsset } from 'main/interfaces/SnipeITAsset';
import { SnipeITUser } from 'main/interfaces/SnipeITUser';
import path from 'path';

interface IArgs {
  user: SnipeITUser;
  assets: SnipeITAsset[];
  filePath: string;
  templatePath: string;
}

export default async function GeneratePdf(event: any, args: IArgs) {
  console.log(args);
  const {
    patchDocument,
    PatchType,
    TextRun,
    Table,
    TableRow,
    TableCell,
    Paragraph,
    VerticalAlign,
    AlignmentType,
    WidthType,
  } = require('docx');
  const libre = require('libreoffice-convert');
  libre.convertAsync = require('util').promisify(libre.convert);
  const fs = require('fs');

  try {
    patchDocument(
      fs.readFileSync(path.resolve(args.templatePath)),
      {
        patches: {
          pin: {
            type: PatchType.PARAGRAPH,
            children: [new TextRun(args.user.employee_num)],
          },
          full_name: {
            type: PatchType.PARAGRAPH,
            children: [new TextRun(args.user.name)],
          },
          email: {
            type: PatchType.PARAGRAPH,
            children: [new TextRun(args.user.email)],
          },
          table: {
            type: PatchType.DOCUMENT,
            children: [
              new Table({
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: 'Asset Tag',
                                bold: true,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        verticalAlign: VerticalAlign.CENTER,
                        shading: {
                          fill: '1C164F',
                        },
                        width: {
                          size: 20,
                          type: WidthType.PERCENTAGE,
                        },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: 'Make',
                                bold: true,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        verticalAlign: VerticalAlign.CENTER,
                        shading: {
                          fill: '1C164F',
                        },
                        width: {
                          size: 60,
                          type: WidthType.AUTO,
                        },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: 'Serial',
                                bold: true,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        verticalAlign: VerticalAlign.CENTER,
                        shading: {
                          fill: '1C164F',
                        },
                        width: {
                          size: 20,
                          type: WidthType.PERCENTAGE,
                        },
                      }),
                    ],
                    tableHeader: true,
                  }),
                  ...args.assets.map((asset: any) => {
                    return new TableRow({
                      children: [
                        new TableCell({
                          children: [new Paragraph(asset.asset_tag)],
                          verticalAlign: VerticalAlign.CENTER,
                        }),
                        new TableCell({
                          children: [new Paragraph(asset.asset_model)],
                          verticalAlign: VerticalAlign.CENTER,
                        }),
                        new TableCell({
                          children: [new Paragraph(asset.asset_serial)],
                          verticalAlign: VerticalAlign.CENTER,
                        }),
                      ],
                    });
                  }),
                ],
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
              }),
            ],
          },
        },
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
