/**
 * Defines the patches to be applied to the template.
 * @param {Object} docxModule - The docx module. This is passed in from the application.
 * @param {Object} args - The arguments passed in from the application. It contains the user and assets objects.
 * @returns {Object} - Returns an object containing the patches to be applied to the template.
 */
export default function patches(docxModule, args) {

    // import required classes from the docx module
    const {
        PatchType,
        TextRun,
        Table,
        TableRow,
        TableCell,
        Paragraph,
        VerticalAlign,
        AlignmentType,
        WidthType
      } = docxModule;

      return {
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
                ...args.assets.map((asset) => {
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
    }

}
