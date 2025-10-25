#include "header.h"

class Player {
  // 类的内容默认为私有的
  int privite_val;
  public:
    int public_val;
    void set_val(int val) {
      privite_val = val;
    }
};
int main () {
  Player player;
  player.public_val = 1;
  player.set_val(2);
  // player.privite_val = 2;// 报错
}

