--select * from cCore_Vouchers_0 where sName like '%Mobile POS Day In-End Stock voucher%' --8006

--select convert (nvarchar, dbo.IntToDate(eh.DayInDate),105) AS DayInDate,
-- convert (nvarchar, dbo.IntToDate(eh.DayEndDate),105) AS DayEndDate
--from tCore_Header_0 h
--join tCore_HeaderData8006_0 eh on eh.iHeaderId = h.iHeaderId
--where h.iVoucherType = 8006

--select 
--    convert(nvarchar, dbo.IntToDate(eh.DayInDate), 105) AS DayInDate,
--    convert(nvarchar, dbo.IntToDate(eh.DayEndDate), 105) AS DayEndDate
--from tCore_Header_0 h
--join tCore_HeaderData8006_0 eh on eh.iHeaderId = h.iHeaderId
--where h.iVoucherType = 8006
--  and CAST(dbo.IntToDate(eh.DayInDate) AS date) = CAST(GETDATE() AS date)


  select top 1
    convert(nvarchar, dbo.IntToDate(eh.DayInDate), 105) AS DayInDate,
	eh.DayInDate intDayInDate,
    convert(nvarchar, dbo.IntToDate(eh.DayEndDate), 105) AS DayEndDate,
    CASE 
        WHEN eh.DayInDate IS NOT NULL 
             AND CAST(dbo.IntToDate(eh.DayInDate) AS date) = CAST(GETDATE() AS date) THEN 'true'
        ELSE 'false' 
    END AS IsDayInDateToday,
    CASE 
        WHEN eh.DayEndDate IS NULL OR eh.DayEndDate = 0 THEN 'false' 
        ELSE 'true' 
    END AS IsDayEndDatePresent,
	sVoucherNo,eh.DayEndDate
from tCore_Header_0 h
join tCore_HeaderData8006_0 eh on eh.iHeaderId = h.iHeaderId
where h.iVoucherType = 8006
order by h.iDate desc, h.iHeaderId desc
 -- and CAST(dbo.IntToDate(eh.DayInDate) AS date) = CAST(GETDATE() AS date)


 --select * from cCore_Vouchers_0 where sName like '%exces%' --Mobile POS Outlet Day In Shortages , 5394 , Mobile POS Outlet Day In Excess 2066


 UPDATE eh
SET eh.DayEndDate = 0
FROM tCore_HeaderData8006_0 eh
JOIN (
    SELECT TOP 1 h.iHeaderId
    FROM tCore_Header_0 h
    JOIN tCore_HeaderData8006_0 eh2 ON eh2.iHeaderId = h.iHeaderId
    WHERE h.iVoucherType = 8006
    ORDER BY h.iDate DESC, h.iHeaderId desc
) AS latest ON latest.iHeaderId = eh.iHeaderId;


select dbo.IntToDate(132712963)

