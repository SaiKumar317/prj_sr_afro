select sBatchNo, iBatchId,iExpiryDate,sum(Batch_Qty) BatchQty, iProduct,iInvTag from (
select i.iProduct, b.sBatchNo, b.iBatchId,convert(varchar,dbo.IntToDate(b.iExpiryDate),103) iExpiryDate,d.iInvTag,
sum(i.fQuantityInBase) Batch_Qty,MIN(iDate) VoucherDate from tCore_Header_0 h
join tCore_Data_0 d on d.iHeaderId = h.iHeaderId 
join tCore_Indta_0 i on i.iBodyId = d.iBodyId
join tCore_Batch_0 b on b.iBodyId = d.iBodyId 
where
--i.iProduct = {Item} and 
--d.iInvTag = 450 and
h.iDate <= dbo.DateToInt(getdate())
and h.bUpdateStocks = 1 
and h.bSuspended = 0 and h.iAuth = 1 and d.bSuspendUpdateStocks = 0 
group by i.iProduct, b.sBatchNo, b.iBatchId , b.iExpiryDate,d.iInvTag
having sum(i.fQuantityInBase) <> 0 --and  b.iExpiryDate>=dbo.DateToInt(GETDATE())
)a
--where sBatchNo IN('{_mixing.BatchNo}')
group by sBatchNo, iBatchId ,iExpiryDate, iProduct,iInvTag
HAVING SUM(a.Batch_Qty) > 0
order by iExpiryDate

select * from vCore_ibals_0 --where iProduct=11932 and iInvTag=450
