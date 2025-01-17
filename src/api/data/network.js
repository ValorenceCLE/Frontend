const networkData = {
    network_settings: {
      default: {
        ip_address: "xxx.xxx.xxx.xxx",
        subnet_mask: "xxx.xxx.xxx.xxx",
        gateway: "xxx.xxx.xxx.xxx",
        dhcp_enabled: true,
        perfered_dns: "xxx.xxx.xxx.xxx",
        alternate_dns: "xxx.xxx.xxx.xxx",
        https_port: 443,
      },
      custom: {
        ip_address: "192.168.1.2",
        subnet_mask: "255.255.255.0",
        gateway: "192.168.1.1",
        dhcp_enabled: true,
        perfered_dns: "192.168.1.1",
        alternate_dns: "8.8.8.8",
        https_port: 443,
      },
    },
};
  
export default networkData;
  