
import env from '@src/env';

let Logger = {
    log(msg){
        if(env.MODE === 'develop'){
            console.log(JSON.stringify(msg));
        }
    },

    alert(msg){
        if(env.MODE === 'develop'){
            console.error(JSON.stringify(msg));
        }
    }
};

export default Logger;