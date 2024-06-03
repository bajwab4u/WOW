import { SharedHelper } from "shared/common/shared.helper.functions";

export const ClientsPatientsTableConfig = {

  apiQueryParams: [],
  searchTerm: '',
  showHeader: true,
  searchPlaceholder: 'Search Patient',
  cusorType: 'pointer',
  showRowActions: true,
  title: 'Patients',
  addBtnTxt: 'Invite Patient',
  endPoint: `/v2/affiliate/${SharedHelper.getUserAccountId()}/fetchPatientsByAffiliateId`,


  columns: [
    { name: 'sideBorder', title: '', isKeyExist: false },
    { name: 'image', title: '', width: '7%' },
    { name: 'name', title: 'Name', width: '31%' },
    { name: 'email', title: 'Email', width: '31%' },
    { name: 'contact', title: 'Contact', width: '31%' },
  ]
};
