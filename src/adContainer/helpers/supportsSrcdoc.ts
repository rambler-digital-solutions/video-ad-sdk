const supported = 'srcdoc' in document.createElement('iframe')
const supportsSrcdoc = (): boolean => supported

export default supportsSrcdoc
