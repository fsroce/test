#include "header.h"

class A {
  private:
    // 构造函数写在private中，表示类不能被实例化 只能通过A::method()的方式使用
    A () {}
  public:
    static void C () {}
};

class B {
  public:
    // 同上，表示类不能被实例化
    B() = delete;
    static void D () {}
};

int main () {
  // A a;// 报错 不可访问
  // B b; // 报错 不可访问
  A::C();
  B::D();
}
