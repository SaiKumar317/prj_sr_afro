SELECT
	MAX(b.sBatchNo) AS sBatchNo,       -- Pick a representative batch name per batch id
	b.iBatchId,
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
    d.iInvTag,
	w.sName warehouse,
    MAX(b.iMfDate) AS iMfDate--,
    --MIN(h.iDate) AS VoucherDate,
    --MAX(h.sVoucherNo) AS sVoucherNo,
    --MAX(h.iVoucherType) AS iVoucherType,
    --MAX(d.iBodyId) AS iBodyId
FROM tCore_Header_0 h
JOIN tCore_Data_0 d   ON d.iHeaderId = h.iHeaderId 
JOIN tCore_Indta_0 i  ON i.iBodyId = d.iBodyId
JOIN tCore_Batch_0 b  ON b.iBodyId = d.iBodyId 
join mCore_Warehouse w on w.iMasterId = d.iInvTag
WHERE
    i.iProduct = 14944 AND 
	d.iInvTag = 1868
    AND h.iDate <= dbo.DateToInt(GETDATE())
    AND h.bUpdateStocks = 1
    AND h.bSuspended = 0
    AND d.iAuthStatus < 2
    AND d.bSuspendUpdateStocks = 0 
	--and b.iBatchId in( 7046,7045)
	--and sBatchNo in ('%567%')
GROUP BY
    i.iProduct,
    b.iBatchId,
    d.iInvTag
HAVING
    SUM(i.fQuantityInBase) <> 0
	order by iExpiryDate;