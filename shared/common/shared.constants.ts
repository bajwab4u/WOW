export const UN_SAVED_CHANGES = {
    title: 'Are you sure you want to leave?',
    message: 'You have unsaved changes. Are you sure you want to leave this page? Unsaved changes will be lost.',
    postiveBtnTxt: 'Discard changes',
    negBtnTxt: 'Stay on this page'
};

export enum SIGNAL_TYPES {
    FORM_SUBMITTED = 'FORM_SUBMITTED',
    INVALID_DATA = 'INVALID_DATA',
    FORM_CHANGED = 'FORM_CHANGED',
    SUBMIT_FORM = 'SUBMIT_FORM',
    DATA_UPDATE = 'DATA_UPDATE',
    TABLE_SIGNALS = 'TABLE_SIGNALS',
    CONFIRM_DIALOG = 'CONFIRMDIALOG',
    TABLE = 'TABLE',
    HAS_UNSAVED_CHANGES = 'HAS_UNSAVED_CHANGES',
    INPUT_CHANGE = 'INPUT_CHANGE'

};

export const ALERT_CONFIG = {
    positiveBtnTxt: 'Yes',
    negBtnTxt: 'No',
    positiveBtnBgColor: '#dc3545',
    negBtnBgColor: 'transparent',
    modalWidth: '400px',
    alertImage: '',
    showImg: false
}
export const WARNING_BTN = '#dc3545';
export const SUCCESS_BTN = '#009c6d';