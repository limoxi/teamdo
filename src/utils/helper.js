

export default {
    noop(){},

    //查询是否为空
    isEmptyObject(obj){
        for(let i in obj){
            return false;
        }
        return true;
    },

    //将得到的background-color由rgb格式(rgb(255, 255, 255))转换为hex格式(#ffffff)
    rgbToHex(bgColor){
        if(!bgColor) return;
        bgColor = bgColor.substring(4, bgColor.length-1).split(',');
        let r = parseInt(bgColor[0]);
        let g = parseInt(bgColor[1]);
        let b = parseInt(bgColor[2]);
        return '#' + r.toString(16) + g.toString(16) + b.toString(16);
    },

    extend(target,src){
        for(let name in src){
            if(src.hasOwnProperty(name)){
                target[name] = src[name];
            }
        }
        return target;
    },

};