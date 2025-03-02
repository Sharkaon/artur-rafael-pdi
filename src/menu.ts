import { BrowserWindow, dialog, Menu, MenuItem } from "electron";

export class PDIMenuBuilder {
  private readonly mainWindow: BrowserWindow;
  private readonly menu: Menu;

  public constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.menu = new Menu();
  }

  public addMenuItems = (): this => {
    const menuItems = this.getMenuItems();

    menuItems.forEach(menuItem => this.menu.append(menuItem));

    return this;
  }

  public finish(): Menu {
    return this.menu;
  }

  private openFile = () => {
    const files = dialog.showOpenDialogSync(this.mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'Images', extensions: ['jpeg', 'jpg', 'png'] }
        ]
    })

    if (!files) return

    const filePath = files[0]
    this.mainWindow.webContents.send('file-selected', filePath);
  }

  private getMenuItems = (): MenuItem[] => {
    const fileMenuItem = new MenuItem({
      label: "Arquivo",
      click: () => this.openFile()
    });

    return [fileMenuItem]
  }
}