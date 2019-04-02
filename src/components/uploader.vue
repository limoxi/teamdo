<style lang="less" scoped>
	.aui-uploader{
		&:hover{
			.aui-i-btn{
				display: block;
			}
			.ivu-upload{
				background: rgba(255,255,255,0.6);
			}
		}
		.aui-i-image{
			width:80px;
			border-radius: 55px;
		}
		.aui-i-btn{
			display: none;
			position: absolute;
			margin-left: 15px;
			margin-top: -3px;
		}
		.ivu-upload{
			position: absolute;
			width: 80px;
			height: 80px;
			top: 0;
			border-radius: 45px;
		}
	}
</style>
<template>
	<div class="aui-uploader">
		<img :src="imgSrc" alt="image" class="aui-i-image"/>
		<Upload
			ref="upload"
			:show-upload-list="false"
			:format="['jpg','jpeg','png', 'icon']"
			:max-size="500"
			:on-format-error="handleFormatError"
			:on-exceeded-size="handleMaxSize"
			:before-upload="handleBeforeUpload"
			action="#"
		>
			<div class="aui-i-btn">
				<Icon type="ios-camera" size="50"></Icon>
			</div>
		</Upload>
	</div>

</template>
<script>

    import Resource from '@/utils/resource';
    import defaultAvatar from '@/images/default-avatar.webp';

    export default {
        props: ['src'],
        data () {
            return {
			}
        },
		computed:{
            imgSrc: {
                get(){
                    return !!this.src ? this.src: defaultAvatar;
				},
				set(newVal){
                    this.$emit('update:src', newVal);
				}
			}
		},
        methods: {
            handleUploaded (file){
                let that = this;
                let reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = function(){
                    let img = new Image();
                    img.src = this.result;
                    img.onload = () =>{
						let compressedImage = that.compress(img);
                        that.imgSrc = compressedImage;
                    };
                }
            },
            handleBeforeUpload(file){
                this.file = file;
                this.handleUploaded(file);
                return false;
            },
            compress(img){
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
                    img.onload = function () {
                        let data = self.compress(img);
                        self.imgUrl = result;
                    };
                }
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
