import { BrowserWindow, dialog, Menu, MenuItem } from "electron";
import { Effect } from "./types";
import path from 'node:path';
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

  private newWindow = () => {
    const window = new BrowserWindow({
        width: 380,
        height: 200,
            webPreferences: {
              webSecurity: false,
            },
      });
      window.loadFile(path.join(__dirname, `../../about.html`));
      window.setMenuBarVisibility(false);  
  }

  private apply(effect: Effect): void {
    this.mainWindow.webContents.send('apply', effect)
  }

  private save(): void {
    this.mainWindow.webContents.send('save');
  }

  private getMenuItems = (): MenuItem[] => {
    const fileMenuItem = new MenuItem({
      label: "Arquivo",
      submenu:
      [
        {
          label: 'Abrir imagem',
          click: () => this.openFile()
        },
        {
          label: 'Salvar imagem',
          click: () => this.save()
        },
        {
          label: 'Sobre',
          click: () => this.newWindow()
        },
        {
          label: 'Sair',
          click: () => this.mainWindow.close()
        }
      ]
    });
    const geometricTransformationsMenuItem = new MenuItem({
      label: "Transformações geométricas", 
      submenu: 
      [
        {
            label: 'Transladar',
            click: () => this.apply('translate'),
        },
        {
            label: 'Rotacionar',
            click: () => this.apply('rotate'),
        },
        {
            label: 'Espelhar',
            click: () => this.apply('mirror')
        },
        {
          label: 'Aumentar',
          click: () => this.apply('increase')
        },
        {
          label: 'Diminuir',
          click: () => this.apply('reduce')
        },
      ],
    });
    const filterMenuItem = new MenuItem({
      label: "Filtros",
      submenu: 
      [
        {
          label: 'Grayscale',
          click: () => this.apply('grayscale'),
        },
        {
          label: 'Passa Baixa',
          click: () => this.apply('filter'),
        },
        {
          label: 'Passa Alta',
          click: () => this.apply('borders'),
        },
        {
          label: 'Threshold',
          click: () => this.apply('threshold'),
        },
        {
          label: 'Brilho',
          click: () => this.apply('brightness'),
        },
        {
          label: 'Contraste',
          click: () => this.apply('contrast'),
        },
      ]
    });
    const mathMorphologyMenuItem = new MenuItem({
      label: "Morfologia matemática",
      submenu: 
      [
        {
          label: 'Dilatação',
          click: () => this.apply('dilatation')
        },
        {
          label: 'Erosão',
          click: () => this.apply('erosion')
        },
        {
          label: 'Abertura',
          click: () => this.apply('opening')
        },
        {
          label: 'Fechamento',
          click: () => this.apply('closing')
        },
      ]
    })
    const featureExtractionMenuItem = new MenuItem({
      label: "DESAFIO",
      submenu: [
        {
          label: 'Contagem de Pilula',
          click: () => this.apply('countPills'),
        }
      ]
    })

    const viewMenuItem = new MenuItem({
      label: "Visualização",
      submenu: [
        {
          label: "Zoom In",
          role: 'zoomIn'
        },
        {
          label: "Zoom Out",
          role: 'zoomOut'
        },
        {
          label: "Reset Zoom",
          role: 'resetZoom'
        }
      ]
    })
    return [fileMenuItem, geometricTransformationsMenuItem, filterMenuItem, mathMorphologyMenuItem, featureExtractionMenuItem, viewMenuItem]
  }
}