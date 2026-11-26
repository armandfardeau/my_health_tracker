const {withAppDelegate}=require('expo/config-plugins');
module.exports=config=>withAppDelegate(config,result=>{
 const anchor='return super.application(application, didFinishLaunchingWithOptions: launchOptions)';
 if(!result.modResults.contents.includes(anchor))throw Error('Point d’initialisation iOS introuvable');
 result.modResults.contents=result.modResults.contents.replace(anchor,`var journal = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent("Journal", isDirectory: true)
    do {
      try FileManager.default.createDirectory(at: journal, withIntermediateDirectories: true)
      var flags = URLResourceValues()
      flags.isExcludedFromBackup = true
      try journal.setResourceValues(flags)
    } catch { fatalError("Stockage local indisponible") }
    `+anchor);
 return result;
});
