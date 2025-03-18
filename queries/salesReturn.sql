SELECT *
from cCore_Vouchers_0
where sName LIKE '%Mobile POS Sales Invoice%';
--3342, Mobile POS Sales Return(1795)

select iLinkPathId, *
from vmCore_Links_0
where BaseVoucherId=3342



select distinct h.sVoucherNo, h.iHeaderId, d.iBodyId, abs(ind.fQuantity) [orderQty], ind.iProduct, vl.Balance
FROM tCore_Header_0 h
    --JOIN cCore_Vouchers_0 v with (ReadUncommitted) ON v.iVoucherType = h.iVoucherType
    JOIN tCore_Data_0 d ON d.iHeaderId = h.iHeaderId
    join tCore_Data_Tags_0 tag on tag.iBodyId=d.iBodyId
    JOIN tCore_Indta_0 ind ON ind.iBodyId = d.iBodyId
    LEFT JOIN vCore_AllLinks219023107_0 vl ON vl.iRefId = d.iTransactionId
WHERE h.iVoucherType=3342 AND
    (bVersion IS NULL OR bVersion = 0) AND h.bDraft = 0
    and bClosed<>1
order by iHeaderId desc