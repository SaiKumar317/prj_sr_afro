select iMasterId, sName [label], sCode [value] from mCore_companybranch where iStatus<>5 and sName<>''

and iMasterId in 
(select um.iMasterId 
from  mSec_UserMasterRestriction um
join mSec_Users_Roles ur on um.iUserId=ur.iUserId
join mSec_RoleTransRights urt on urt.iRoleId=ur.iERPRole
where um.iUserId in (select iUserId from mSec_Users where sLoginName='Hatchery') and um.iMasterTypeId=3018) and iStatus<>1 and bGroup=0 order by sName



select iMasterId, sName [label], sCode [value] from mCore_Location where iStatus<>5 and sName<>''

and iMasterId in 
(select um.iMasterId 
from  mSec_UserMasterRestriction um
join mSec_Users_Roles ur on um.iUserId=ur.iUserId
join mSec_RoleTransRights urt on urt.iRoleId=ur.iERPRole
where um.iUserId in (select iUserId from mSec_Users where sLoginName='Hatchery') and um.iMasterTypeId=6) and iStatus<>1 and bGroup=0 order by sName



--select * from mSec_UserMasterRestriction

--select * from cCore_MasterDef where sMasterName like '%location%'

--select * from mCore_Location where iStatus <> 5 and iMasterId = 39


--select * from cCore_Vouchers_0 where sName like '%Mobile POS Sale Preference Mapping%' 8002

select top 1 h.sVoucherNo,d.iInvTag [warehouseId], d.iFaTag [compBranchId] , dd.CustomerAccount,
dd.SalesAccount,dd.CashAccount, dd.UPI_MPAccount
from tCore_Header_0 h 
join tCore_Data_0 d on h.iHeaderId=d.iHeaderId
join tCore_Data8002_0 dd on dd.iBodyId=d.iBodyId
where h.iVoucherType=8002 and d.iFaTag = 113
order by h.iDate desc;
select iLinkId [employeeId] from mSec_Users where sLoginName like 'su' and  iUserType = 1 

