SELECT mp.iCategory, pImage,CAST(pImage AS VARCHAR(MAX)) pImageNameStr,pImageName, p.iMasterId, p.sName,
(select top 1 fVal0 
from mCore_SellingPriceBookDetails spb 
join mCore_SellingPriceBookHeader sph on spb.iPriceBookId = sph.iPriceBookId
where spb.iProductId = p.iMasterId and sph.bActive = 1 and sph.bMarkDeleted = 0 and 
dbo.DateToInt(GETDATE()) between spb.iStartDate and case when spb.iEndDate = 0 then dbo.DateToInt(GETDATE()) else spb.iEndDate end
order by case when spb.iEndDate = 0 then dbo.DateToInt(GETDATE()) else spb.iEndDate end desc) as rate
FROM mCore_Product p 
JOIN muCore_Product mp ON mp.iMasterId = p.iMasterId
WHERE iStatus = 0 AND bGroup = 0 AND p.iMasterId <> 0 
AND iCategory <> 0 AND iCategory = 2

select mp.iCategory, pImage,CAST(pImage AS VARCHAR(MAX)) pImageNameStr,pImageName,
p.sName,p.sCode,spbd.fVal5,spbd.fVal6,spbd.fVal7,spbd.fVal8,spbd.iStartDate
from mCore_SellingPriceBookHeader spbh
join mCore_SellingPriceBookDetails  spbd on spbh.iPriceBookId=spbd.iPriceBookId
join mCore_Product p on p.iMasterId=iProductId
JOIN muCore_Product mp ON mp.iMasterId = p.iMasterId
join mCore_Units u on u.iMasterId = spbd.iUnit
where spbh.bMarkDeleted=0 
--and iStartDate=(select top 1 iStartDate from mCore_SellingPriceBookDetails order by iStartDate desc)
--order by spbd.iStartDate
--dbo.DateToInt(dbo.IntToGregDateTime(spbd.iModifiedDate))>=dbo.DateToInt(GETDATE())

select * from mCore_SellingPriceBookHeader
select * from mCore_SellingPriceBookDetails

--select pImage,pImageName, * from vmCore_Product where sCode='Stiching-thread-tkt-30-shade-3175'

--SELECT iMasterId, sName, sCode from mPos_Category where iStatus = 0 and bGroup=0 and iMasterId <> 0 
select top 1 fVal0 
from mCore_SellingPriceBookDetails spb 
join mCore_SellingPriceBookHeader sph on spb.iPriceBookId = sph.iPriceBookId
where spb.iProductId = 1532 and sph.bActive = 1 and sph.bMarkDeleted = 0 and 
dbo.DateToInt(GETDATE()) between spb.iStartDate and case when spb.iEndDate = 0 then dbo.DateToInt(GETDATE()) else spb.iEndDate end
order by case when spb.iEndDate = 0 then dbo.DateToInt(GETDATE()) else spb.iEndDate end desc