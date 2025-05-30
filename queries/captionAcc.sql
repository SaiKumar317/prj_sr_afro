select *
from tCore_Header_0 h join tCore_Data_0 d on h.iHeaderId=d.iHeaderId
where iVoucherType=3342 and sVoucherNo='1'


select sMasterName FaTag, *
from cCore_MasterDef
where imastertypeid in (select ivalue
from cCore_PreferenceVal_0
where ifieldid = 0 and icategory = 0)
select sMasterName IInvTag
from cCore_MasterDef
where imastertypeid in (select ivalue
from cCore_PreferenceVal_0
where ifieldid = 1 and icategory = 0)



select *
from mCore_
{dynmastername} where iStatus<> and iMasterId>0

update mSec_Users set sPassword = N'010c0088'

select *
from mCore_division
where iMasterId = 148

select *
from cCore_PreferenceVal_0
where iValue = 3018

select *
from cCore_MasterDef
where sMasterName like '%divi%'
--3001

select *
froM cCore_PreferenceText_0
where iFieldId =0

select *
from mCore_companybranch
where iMasterId = 148

select *
from v_MasterDef
where iMasterTypeId = 3018
select *
from cCore_MasterDef
where iMasterTypeId = 3018

select sCaption FaTag, iMasterTypeId, *
from v_MasterDef
where imastertypeid in (select ivalue
from cCore_PreferenceVal_0
where ifieldid = 0 and icategory = 0)


select sCaption IInvTag
from v_MasterDef
where imastertypeid in (select ivalue
from cCore_PreferenceVal_0
where ifieldid = 1 and icategory = 0)
SELECT *, CASE WHEN pLogo IS NOT NULL THEN 'data:image/jpeg;base64,' + CAST('' as XML).value('xs:base64Binary(sql:column(''pLogo''))', 'VARCHAR(MAX)') ELSE NULL END as Base64Logo
FROM mCore_Company;