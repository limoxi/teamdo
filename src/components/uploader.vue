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
    import ImageCompressor from '@/service/image_compressor';
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
                    return this.src || defaultAvatar;
				},
				set(newVal){
                    this.$emit('update:src', newVal);
				}
			}
		},
        methods: {
            handleBeforeUpload(file){
                new ImageCompressor(file).compress().then(compressedDataUrl =>{
                    this.imgSrc = compressedDataUrl;
				});
                return false;
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
