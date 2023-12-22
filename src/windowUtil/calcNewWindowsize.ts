export const calcNewWindowSize = (widthRatio:number, heightRatio:number) => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
  
    // 16:9の比率で最適なサイズを計算
    let newWidth = windowWidth;
    let newHeight = newWidth / widthRatio * heightRatio;
    if (newHeight > windowHeight) {
      newHeight = windowHeight;
      newWidth = newHeight / heightRatio * widthRatio;
    }
    return [newWidth, newHeight];
}