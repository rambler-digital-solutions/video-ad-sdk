const supported = 'srcdoc' in document.createElement('iframe')

export const supportsSrcdoc = (): boolean => supported
