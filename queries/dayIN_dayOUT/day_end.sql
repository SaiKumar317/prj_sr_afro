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
    SUM(i.fQuantityInBase) AS openAccept,
      i.iProduct,
    MAX(d.iInvTag) AS iInvTag,
    MAX(b.iMfDate) AS iMfDate,
     MAX(p.sName) AS itemName,
      MAX(u.sCode) AS unit,
    MAX(up.ItemType) AS ItemType,
	MAX(ISNULL(abs(ci.fQiss), 0)) AS fQiss,
    MAX(ISNULL(ci.fQrec, 0)) AS fQrec
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
LEFT JOIN vCore_ibals_0 ci ON ci.iProduct = i.iProduct AND ci.iInvTag = d.iInvTag AND ci.iDate = dbo.DateToInt('2025-09-30')

WHERE
    --i.iProduct = 16935 AND 
    d.iInvTag = 1868
	AND h.iDate <= 132843265
   -- AND h.iDate <= dbo.DateToInt(GETDATE())
	 AND h.iDate <= dbo.DateToInt('2025-09-30')
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

SELECT 
    CONVERT(nvarchar, dbo.IntToDate(ISNULL(eh.DayInDate, 0)), 105) AS DayInDate,
    CONVERT(nvarchar, dbo.IntToDate(ISNULL(eh.DayEndDate, 0)), 105) AS DayEndDate,
    
    CASE 
        WHEN eh.DayInDate IS NOT NULL 
             AND CAST(dbo.IntToDate(eh.DayInDate) AS date) = CAST(GETDATE() AS date) THEN 'true'
        ELSE 'false' 
    END AS IsDayInDateToday,

    CASE 
        WHEN eh.DayEndDate IS NULL OR eh.DayEndDate = 0 THEN 'false' 
        ELSE 'true' 
    END AS IsDayEndDatePresent,

    ISNULL(h.sVoucherNo, '') AS sVoucherNo,
    h.iHeaderId,

    ISNULL(abs(ci.fQiss), 0) AS fQiss,
    ISNULL(ci.fQrec, 0) AS fQrec,

    ISNULL(i.iProduct, 0) AS iProduct,
    ISNULL(i.fQuantity, 0) AS fQuantity,

    ISNULL(bsd.mInput2, 0) AS openQty,
	d.iBodyId,
	d.iInvTag,
     p.sName AS itemName,
     u.sCode AS unit,
    up.ItemType AS ItemType,
	h.iDate docDate,
	eh.DayInDate,
	d.iFaTag divisionId,
	t.iTag6 branchId,
	isnull(t.iTag3062,0) reasonId


FROM tCore_Header_0 h
JOIN tCore_HeaderData8006_0 eh ON eh.iHeaderId = h.iHeaderId
JOIN tCore_Data_0 d ON d.iHeaderId = h.iHeaderId
JOIN tCore_Indta_0 i ON i.iBodyId = d.iBodyId
join tCore_Data_Tags_0 t on t.iBodyId = d.iBodyId
JOIN tCore_IndtaBodyScreenData_0 bsd ON bsd.iBodyId = d.iBodyId
join mCore_Product p on p.iMasterId = i.iProduct
left join muCore_Product up on up.iMasterId = i.iProduct
left join muCore_Product_Units pu on pu.iMasterId = i.iProduct
left join mCore_Units u on u.iMasterId = pu.iDefaultBaseUnit

LEFT JOIN vCore_ibals_0 ci ON ci.iProduct = i.iProduct AND ci.iInvTag = d.iInvTag AND ci.iDate = h.iDate


WHERE h.iVoucherType = 8006 and h.sVoucherNo = 9--AND h.iHeaderId = 7466;


select sName label, iMasterId value from mCore_outletstocklossreasons 
    where iMasterId <> 0 and iStatus <>5

--select * from cCore_MasterDef where sMasterName like '%stocklo%'