<template>
	<div>
		<img :src="fileB64"  alt=""/>
		<Upload
			ref="upload"
			:show-upload-list="true"
			:on-success="()=>{}"
			:format="['jpg','jpeg','png', 'icon']"
			:max-size="500"
			:on-format-error="handleFormatError"
			:on-exceeded-size="handleMaxSize"
			:before-upload="handleBeforeUpload"
			action="#"
			style="display: inline-block;width:58px;"
		>
			<slot></slot>
		</Upload>
	</div>

</template>
<script>

    import Resource from '@src/utils/resource';

    export default {
        data () {
            return {
                'file': null
			}
        },
        methods: {
            handleUploaded (file){
                console.log(file);
            },
            handleBeforeUpload(file){
                this.file = file;
                this.compressImage(file);
                this.handleUploaded(file);
                return false;
            },
            compress(image){
                let canvas = document.createElement("canvas");
                let width = image.width;
                let height = image.height;
                canvas.width = width;
                canvas.height = height;

                let ctx = canvas.getContext("2d");
                ctx.fillStyle = "#fff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, width, height);

                //进行最小压缩
                return canvas.toDataURL("image/jpeg", 0.1);
        	},
            async getCompressB64Image(file){
                let self = this;
                let reader = new FileReader();
                //将图片转成base64格式
                reader.readAsDataURL(file);
                //读取成功后的回调
                reader.onloadend = function() {
                    let result = this.result;
                    let img = new Image();
                    img.src = result;
                    img.onload = function() {
                        let data = self.compress(img);
                        self.imgUrl = result;


			},
            handleFormatError (file) {
                this.$Notice.warning({
                    title: '文件格式错误',
                    desc: '只支持jpg、png格式'
                });
            },
            handleMaxSize (file) {
                this.$Notice.warning({
                    title: '文件最大限制',
                    desc: '不能超过500K.'
                });
            },
        }
    }
</script>
