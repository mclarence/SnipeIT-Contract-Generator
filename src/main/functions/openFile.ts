import { dialog } from "electron";
import { IpcMainEvent } from "electron/main";
import { title } from "process";

interface Arguments {
  title: string;
  filters: { name: string; extensions: string[] }[];
  caller: string;
}

export default async function OpenFile(event: IpcMainEvent, args: Arguments) {
    console.log(args)
    dialog.showOpenDialog({
        title: args.title,
        filters: args.filters,
    })
    .then((result) => {
        event.reply('open-file', {
            ...result,
            caller: args.caller,
        });
    }
    );
}