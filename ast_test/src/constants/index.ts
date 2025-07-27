import { osInfo } from "@/utils/initSys";

const _isWindows = osInfo === 'win32';

export {
  _isWindows
}
