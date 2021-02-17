class ImageCompressor {
  constructor(file) {
    this.file = file;
  }

  async compress() {
    return this.readFileAsync();
  }

  async readFileAsync() {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onloadend = async () => {
        this.loadImgAsync(reader.result).then(compressedDataUrl => {
          resolve(compressedDataUrl);
        }).catch((...args) => {
          reject(args);
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(this.file);
    });
  }

  async loadImgAsync(readerData) {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.onload = async () => {
        resolve(ImageCompressor.__compress(img));
      };
      img.onerror = reject;
      img.src = readerData;
    });
  }

  static __compress(img) {
    let canvas = document.createElement("canvas");
    let width = img.width;
    let height = img.height;
    canvas.width = width;
    canvas.height = height;

    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, width, height);
    //进行最小压缩
    return canvas.toDataURL("image/webp", 0.1);
  }
}

export default ImageCompressor;
