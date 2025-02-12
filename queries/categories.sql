SELECT Image as CategoryImage
FROM mPos_Category muc
JOIN muPos_Category mup ON mup.iMasterId = muc.iMasterId
WHERE mup.iMasterId = ${categoryId}

SELECT 
iMasterId as CategoryId, 
sName as CategoryName, 
sCode as CategoryCode 
FROM mPos_Category 
WHERE iStatus = 0 AND bGroup = 0

SELECT 'data:image/jpeg;base64,' + CAST(N'' AS XML).value('xs:base64Binary(xs:hexBinary(sql:column("Image")))', 'NVARCHAR(MAX)') as CategoryImage
                 FROM muPos_Category muc
                 --JOIN muPos_Category mup ON mup.iMasterId = muc.iMasterId
                 WHERE muc.iMasterId = ${categoryId}

