select i.iproduct, d.iInvTag, b.iBatchId, b.sbatchno, b.iExpiryDate,  sum(i.fquantity) BatchQty, 0 ReservedQty, 0 ReleasedQty from tCore_Indta_0 i  
join tCore_Data_0 d  on i.iBodyId = d.iBodyId  
join tCore_Batch_0 b  on d.iBodyId = b.iBodyId               
join tCore_Header_0 h  on d.iHeaderId = h.iHeaderId and h.bSuspended = 0                 
where 
--i.iProduct = 16935 and 
h.bUpdateStocks = 1 and d.bSuspendUpdateStocks = 0 
--and d.iInvTag = 488  
and iExpiryDate>dbo.DateToInt(GETDATE())
group by i.iProduct, d.iInvTag, b.sBatchNo, b.iBatchId,  b.iExpiryDate  
union  
select i.iproduct, d.iInvTag, b.iBatchId, b.sbatchno, b.iExpiryDate,  0 BatchQty, sum(r.fquantity) ReservedQty, 0 ReleasedQty from tCore_ReservedStock_0 r  
join tCore_Data_0 d  on r.iTransactionId = d.iTransactionId  
join tCore_Batch_0 b  on d.iBodyId = b.iBodyId   
join tCore_Indta_0 i  on d.iBodyId = i.iBodyId  
                  
where r.bReserveOrRelease = 0 and 
--i.iProduct = 16935 and d.iInvTag = 488  and 
iExpiryDate>dbo.DateToInt(GETDATE())
group by i.iProduct, d.iInvTag, b.sBatchNo, b.iBatchId,  b.iExpiryDate  
union  
select i.iproduct, d.iInvTag, b.iBatchId, b.sbatchno, b.iExpiryDate,  0 Batchqty, 0 ReservedQty, sum(r.fquantity) ReleasedQty from tCore_ReservedStock_0 r  
join tCore_Data_0 d  on r.iTransactionId = d.iTransactionId  
join tCore_Batch_0 b  on d.iBodyId = b.iBodyId   
join tCore_Indta_0 i  on d.iBodyId = i.iBodyId                  
where r.bReserveOrRelease = 1 and 
--i.iProduct = 16935 and d.iInvTag = 488  and 
iExpiryDate>dbo.DateToInt(GETDATE())
group by i.iProduct, d.iInvTag, b.sBatchNo, b.iBatchId,  b.iExpiryDate