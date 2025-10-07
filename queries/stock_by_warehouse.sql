select sBatchNo, iBatchId,iExpiryDate, iExpiryDateId,sum(Batch_Qty) BatchQty, iProduct,iInvTag, iMfDate from (
select i.iProduct, b.sBatchNo, b.iBatchId,convert(varchar,dbo.IntToDate(b.iExpiryDate),103) iExpiryDate,b.iExpiryDate iExpiryDateId, d.iInvTag,b.iMfDate,
sum(i.fQuantityInBase) Batch_Qty,MIN(iDate) VoucherDate,H.sVoucherNo,H.iVoucherType, d.iBodyId from tCore_Header_0 h
join tCore_Data_0 d on d.iHeaderId = h.iHeaderId 
join tCore_Indta_0 i on i.iBodyId = d.iBodyId
join tCore_Batch_0 b on b.iBodyId = d.iBodyId 
where
i.iProduct = 16935 and 
d.iInvTag = 488 and
h.iDate <= dbo.DateToInt(getdate())
and h.bUpdateStocks = 1 
and h.bSuspended = 0 and d.iAuthStatus < 2-- and h.iAuth = 1
and d.bSuspendUpdateStocks = 0 
group by i.iProduct, b.sBatchNo, b.iBatchId , b.iExpiryDate,d.iInvTag, iMfDate, H.sVoucherNo,H.iVoucherType,d.iBodyId
--having sum(i.fQuantityInBase) <> 0 
--and  
--b.iExpiryDate>=dbo.DateToInt(GETDATE())
)a
group by sBatchNo, iBatchId ,iExpiryDate,iExpiryDateId, iProduct,iInvTag, iMfDate
--HAVING SUM(a.Batch_Qty) > 0
order by iExpiryDate


--select (fQiss+fQrec),* from vCore_ibals_0
--where iProduct=16935 and iInvTag = 488


SELECT        iProduct, iDate, iTransactionId, iInvTag, SUM(IssuesVal) AS fQiss, SUM(RctVal) AS fQrec, SUM(mStockValue) AS mVal, 0 AS fAltQty, 0 AS fQCQty
FROM            
(SELECT        a.iDate, b.iTransactionId, c.iProduct, b.iInvTag, CASE WHEN c.fQuantityInBase < 0 THEN fQuantityInBase ELSE 0 END AS IssuesVal, 
CASE WHEN c.fQuantityInBase > 0 THEN fQuantityInBase ELSE 0 END AS RctVal, 
CASE WHEN fQuantityInBase > 0 THEN mStockValue ELSE 0 END AS mStockValue
FROM            dbo.tCore_Header_0 AS a 
INNER JOIN dbo.tCore_Data_0 AS b ON a.iHeaderId = b.iHeaderId 
INNER JOIN dbo.tCore_Indta_0 AS c ON b.iBodyId = c.iBodyId
WHERE        (a.bUpdateStocks = 1) AND (a.bSuspended = 0) AND (b.iAuthStatus < 2) AND (b.bSuspendUpdateStocks = 0) and c.iProduct=16935 and b.iInvTag = 488 ) AS a
GROUP BY iDate, iTransactionId, iProduct, iInvTag


--select  (fQiss+fQrec) from tCore_Header_0 h
--join tCore_Data_0 d on d.iHeaderId = h.iHeaderId 
--join tCore_Indta_0 i on i.iBodyId = d.iBodyId
--join tCore_Batch_0 b on b.iBodyId = d.iBodyId 
--join vCore_ibals_0 ib on ib.iProduct = i.iProduct and ib.iInvTag = d.iInvTag
--where i.iProduct=16935 and d.iInvTag = 488  and (h.bUpdateStocks = 1) AND (h.bSuspended = 0) AND (d.iAuthStatus < 2) AND (d.bSuspendUpdateStocks = 0)

--select * from 
--tCore_Header_0 h
--join tCore_Data_0 d on d.iHeaderId = h.iHeaderId
--where d.iBodyId = 2587

--select * from cCore_Vouchers_0 where iVoucherType = 6147