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

  private apply(effect: string): void {
    this.mainWindow.webContents.send('apply', effect)
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
          click: () => console.log("Salvar imagem")
        },
        {
          label: 'Sobre',
          click: () => console.log("Sobre")
        },
        {
          label: 'Sair',
          click: () => "Sair"
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
            click: () => console.log("Rotacionar")
        },
        {
            label: 'Espelhar',
            click: () => console.log("Espelhar")
        },
        {
          label: 'Aumentar',
          click: () => this.apply('scale')
        },
        {
          label: 'Diminuir',
          click: () => this.apply('scale')
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
          click: () => console.log("Passa Alta")
        },
        {
          label: 'Threshold',
          click: () => this.apply('threshold'),
        },
        {
          label: 'Brilho',
          click: () => this.apply('brightness')
        },
        {
          label: 'Contraste',
          click: () => console.log("Contraste")
        },
      ]
    });
    const mathMorphologyMenuItem = new MenuItem({
      label: "Morfologia matemática",
      submenu: 
      [
        {
          label: 'Dilatação',
          click: () => console.log("Dilatação")
        },
        {
          label: 'Erosão',
          click: () => console.log("Erosão")
        },
        {
          label: 'Abertura',
          click: () => console.log("Abertura")
        },
        {
          label: 'Fechamento',
          click: () => console.log("Fechamento")
        },
      ]
    })
    const featureExtractionMenuItem = new MenuItem({
      label: "DESAFIO"
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