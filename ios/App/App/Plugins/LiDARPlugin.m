#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(LiDARPlugin, "LiDARPlugin",
           CAP_PLUGIN_METHOD(checkLiDARSupport, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(startScan, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(stopScan, CAPPluginReturnPromise);
)