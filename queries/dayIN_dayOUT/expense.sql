select * from mCore_Account a

join mCore_AccountTreeDetails at on at.iMasterId = a.iMasterId

where at.iParentId = 26304 --
--ag.scode ='2030500003'

select * from mCore_AccountTreeDetails where iParentId = 26304