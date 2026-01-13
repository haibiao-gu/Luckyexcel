import { FromEMF, ToContext2D } from "../common/emf";
import { IattributeList, IuploadfileList } from "../ICommon";
import { LuckyImageBase } from "./LuckyBase";


export class ImageList {
  private images: IattributeList

  constructor(files: IuploadfileList) {
    if (files == null) {
      this.images = {};
      return;
    }
    this.initializeImages(files);
  }

  static async createAsync(files: IuploadfileList, imageHandler?: (imageData: string | ArrayBuffer, fileName: string) => Promise<string>): Promise<ImageList> {
    const instance = new ImageList(files);

    if (imageHandler) {
      await instance.processImagesWithHandler(imageHandler);
    }

    return instance;
  }

  getImageByName(pathName: string): Image {
    if (pathName in this.images) {
      let base64 = this.images[pathName];
      return new Image(pathName, base64);
    }
    return null;
  }

  private initializeImages(files: IuploadfileList) {
    this.images = {};
    for (let fileKey in files) {
      if (fileKey.indexOf("xl/media/") > -1) {
        let fileNameArr = fileKey.split(".");
        let suffix = fileNameArr[fileNameArr.length - 1].toLowerCase();
        if (suffix in { "png": 1, "jpeg": 1, "jpg": 1, "gif": 1, "bmp": 1, "tif": 1, "webp": 1, "emf": 1 }) {
          if (suffix == "emf") {
            var pNum = 0;  // number of the page, that you want to render
            var scale = 1;  // the scale of the document
            var wrt = new ToContext2D(pNum, scale);
            var inp, out, stt;
            FromEMF.K = [];
            inp = FromEMF.C;
            out = FromEMF.K;
            stt = 4;
            for (var p in inp) out[inp[p]] = p.slice(stt);
            FromEMF.Parse(files[fileKey], wrt);
            this.images[fileKey] = wrt.canvas.toDataURL("image/png");
          } else {
            this.images[fileKey] = files[fileKey];
          }
        }
      }
    }
  }

  private async processImagesWithHandler(imageHandler: (imageData: string | ArrayBuffer, fileName: string) => Promise<string>): Promise<void> {
    const promises = [];
    for (let fileKey in this.images) {
      if (this.images.hasOwnProperty(fileKey)) {
        const promise = imageHandler(this.images[fileKey], fileKey)
            .then(res => {
              if (res) this.images[fileKey] = res;
            })
            .catch(err => {
              console.error(`Error processing image ${fileKey}:`, err);
            });
        promises.push(promise);
      }
    }
    await Promise.all(promises);
  }

  // constructor(files: IuploadfileList) {
  //   if (files == null) {
  //     return;
  //   }
  //   this.images = {};
  //   for (let fileKey in files) {
  //     // let reg = new RegExp("xl/media/image1.png", "g");
  //     if (fileKey.indexOf("xl/media/") > -1) {
  //       let fileNameArr = fileKey.split(".");
  //       let suffix = fileNameArr[fileNameArr.length - 1].toLowerCase();
  //       if (suffix in { "png": 1, "jpeg": 1, "jpg": 1, "gif": 1, "bmp": 1, "tif": 1, "webp": 1, "emf": 1 }) {
  //         if (suffix == "emf") {
  //           var pNum = 0;  // number of the page, that you want to render
  //           var scale = 1;  // the scale of the document
  //           var wrt = new ToContext2D(pNum, scale);
  //           var inp, out, stt;
  //           FromEMF.K = [];
  //           inp = FromEMF.C;
  //           out = FromEMF.K;
  //           stt = 4;
  //           for (var p in inp) out[inp[p]] = p.slice(stt);
  //           FromEMF.Parse(files[fileKey], wrt);
  //           this.images[fileKey] = wrt.canvas.toDataURL("image/png");
  //         } else {
  //           this.images[fileKey] = files[fileKey];
  //         }
  //       }
  //     }
  //   }
  // }

  // getImageByName(pathName: string): Image {
  //   if (pathName in this.images) {
  //     let base64 = this.images[pathName];
  //     return new Image(pathName, base64);
  //   }
  //   return null;
  // }
}


class Image extends LuckyImageBase {

  fromCol: number
  fromColOff: number
  fromRow: number
  fromRowOff: number

  toCol: number
  toColOff: number
  toRow: number
  toRowOff: number

  constructor(pathName: string, base64: string) {
    super();
    this.src = base64;
  }

  setDefault() {

  }
}