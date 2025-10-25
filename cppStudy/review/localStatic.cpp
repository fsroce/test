#include "header.h"

void function () {
  // 作为静态变量，可以理解为不会被回收
  static int i = 0;
  i++;
  Log(i);
}

int main()
{
  function();
  function();
  function();
  function();
  function();
  return 0;
}
