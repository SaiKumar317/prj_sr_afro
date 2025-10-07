--select top 1 h.sVoucherNo,d.iInvTag [warehouseId], d.iFaTag [compBranchId] , dd.CustomerAccount,
--dd.SalesAccount,dd.CashAccount, dd.UPI_MPAccount, dd.ExpenseAccount, w.sName warhouseName
--from tCore_Header_0 h 
--join tCore_Data_0 d on h.iHeaderId=d.iHeaderId
--join tCore_Data8002_0 dd on dd.iBodyId=d.iBodyId
--join mCore_Warehouse w on w.iMasterId =d.iInvTag
--where h.iVoucherType=8002

SELECT
	MAX(b.sBatchNo) AS sBatchNo,       -- Pick a representative batch name per batch id
	MAX(b.iBatchId) AS iBatchId,
    CASE 
        WHEN SUM(i.fQuantityInBase) > 0 THEN CONVERT(varchar, dbo.IntToDate(MAX(b.iExpiryDate)), 103) 
        ELSE NULL 
    END AS iExpiryDate,
    CASE 
        WHEN SUM(i.fQuantityInBase) > 0 THEN MAX(b.iExpiryDate) 
        ELSE NULL 
    END AS iExpiryDateId,
    SUM(i.fQuantityInBase) AS BatchQty,
	  i.iProduct,
    MAX(d.iInvTag) AS iInvTag,
    MAX(b.iMfDate) AS iMfDate,
	 MAX(p.sName) AS itemName,
	  MAX(u.sName) AS unit,
	  MAX(up.ItemType) AS ItemType

	--,
    --MIN(h.iDate) AS VoucherDate,
    --MAX(h.sVoucherNo) AS sVoucherNo,
    --MAX(h.iVoucherType) AS iVoucherType,
    --MAX(d.iBodyId) AS iBodyId
FROM tCore_Header_0 h
JOIN tCore_Data_0 d   ON d.iHeaderId = h.iHeaderId 
JOIN tCore_Indta_0 i  ON i.iBodyId = d.iBodyId
JOIN tCore_Batch_0 b  ON b.iBodyId = d.iBodyId 
join mCore_Product p on p.iMasterId = i.iProduct
 left join muCore_Product up on up.iMasterId = i.iProduct
left join muCore_Product_Units pu on pu.iMasterId = i.iProduct
left join mCore_Units u on u.iMasterId = pu.iDefaultBaseUnit

WHERE
    --i.iProduct = 16935 AND 
	d.iInvTag = 488
    AND h.iDate <= dbo.DateToInt(GETDATE())
    AND h.bUpdateStocks = 1
    AND h.bSuspended = 0
    AND d.iAuthStatus < 2
    AND d.bSuspendUpdateStocks = 0 

GROUP BY
    i.iProduct
   -- b.iBatchId,
    --d.iInvTag
HAVING
    SUM(i.fQuantityInBase) <> 0
	order by iExpiryDate;

	--select sName , up.* from mCore_Product p
	--join muCore_Product up on up.iMasterId = p.iMasterId 
	--where p.iMasterId =14944
	--sCode ='SER - 00001'

	select 
	iProduct,
	convert(nvarchar, dbo.IntToDate(iDate), 105) iDate,
	iInvTag,
	fQiss,fQrec
	from vCore_ibals_0 
	where convert(nvarchar, dbo.IntToDate(iDate), 105) = '01-10-2025'
	--and iProduct=14894 and iInvTag = 1868
	order by iProduct desc

