SELECT *
from cCore_Vouchers_0
where sName LIKE '%Mobile POS Sales%';
--3342, Mobile POS Sales Return(1795)

select iLinkPathId, *
from vmCore_Links_0
where BaseVoucherId=3342

select *
from v_MasterDef
where sCaption like '%compan%'

SELECT *
from tCore_Batch_0

select distinct h.sVoucherNo, h.iHeaderId, d.iBodyId, abs(ind.fQuantity) [orderQty], ind.iProduct, vl.Balance, ind.mRate,
    indb.mInput0 [discountP] , indb.mInput1 [discountAmt], indb.mInput3 [vat], indb.mInput4 [excise], b.iBatchId, b.sBatchNo, b.iExpiryDate
, d.iFaTag [companyBranchId], tag.iTag6 [branchId], hd.POSCustomerMobileNumber, hd.POSCustomerName
FROM tCore_Header_0 h
    --JOIN cCore_Vouchers_0 v with (ReadUncommitted) ON v.iVoucherType = h.iVoucherType
    JOIN tCore_Data_0 d ON d.iHeaderId = h.iHeaderId
    JOIN tCore_Batch_0 b ON b.iBodyId = d.iBodyId
    JOIN tCore_HeaderData3342_0 hd ON hd.iHeaderId = h.iHeaderId
    join tCore_Data_Tags_0 tag on tag.iBodyId=d.iBodyId
    JOIN tCore_Indta_0 ind ON ind.iBodyId = d.iBodyId
    JOIN tCore_IndtaBodyScreenData_0 indb ON indb.iBodyId = d.iBodyId
    LEFT JOIN vCore_AllLinks219023107_0 vl ON vl.iRefId = d.iTransactionId
WHERE h.iVoucherType=3342 AND
    (bVersion IS NULL OR bVersion = 0) AND h.bDraft = 0
    and bClosed<>1 and d.iFaTag=113 and tag.iTag6=34
order by h.iHeaderId desc


select *
from(
select h.sVoucherNo, h.iHeaderId,
        CASE 
WHEN ISNULL(SUM(vl.Base), 0) <> 0 AND ISNULL(SUM(vl.Balance), 0) > 0
            AND ISNULL(SUM(vl.Base), 0) > ISNULL(SUM(vl.Balance), 0) THEN 'Partial Consumed'
WHEN ISNULL(SUM(vl.Base), 0) <> 0 AND ISNULL(SUM(vl.Balance), 0) > 0 THEN 'Pending'
ELSE '' END [LinkStatus], d.iFaTag [companyBranchId], tag.iTag6 [branchId]
    FROM tCore_Header_0 h
        --JOIN cCore_Vouchers_0 v with (ReadUncommitted) ON v.iVoucherType = h.iVoucherType
        JOIN tCore_Data_0 d ON d.iHeaderId = h.iHeaderId
        join tCore_Data_Tags_0 tag on tag.iBodyId=d.iBodyId
        JOIN tCore_Indta_0 ind ON ind.iBodyId = d.iBodyId
        LEFT JOIN vCore_AllLinks219023107_0 vl ON vl.iRefId = d.iTransactionId
    WHERE h.iVoucherType=3342 AND
        (bVersion IS NULL OR bVersion = 0) AND h.bDraft = 0
        and bClosed<>1 and d.iFaTag=113 and tag.iTag6=34
    GROUP BY 
h.iHeaderId,h.iDate, h.sVoucherNo,d.iFaTag, tag.iTag6 ) a
where a.[LinkStatus]<>''

order by iHeaderId

