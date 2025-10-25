#include "header.h"

class Base {
  public:
    std::string getName () { return "Base"; }
};

class Derived : public Base {
  private:
    std::string m_Name;
  public:
    Derived (std::string name) : m_Name(name) {}
    std::string getName () { return m_Name; }
};

class Base2 {
  public:
    // 通过virtual关键字声明为虚函数 后面调用时会重写
    virtual std::string getName () { return "Base2"; }
};
class Derived2 : public Base2 {
  private:
    std::string m_Name;
  public:
    Derived2 (std::string name) : m_Name(name) {}
    // override表示该函数被重写了
    std::string getName () override { return m_Name; }
};

int main () {
  Base *b = new Base();
  Derived *d = new Derived("Derived");
  Base *b2 = d;
  Log(b->getName());// Base expected & Base
  Log(d->getName());// Derived expected & Derived
  Log(b2->getName());// Derived expected but Base
  /**
   * 为什么会这样，因为b2本质上是一个指向Base的实例的指针 在编译时就确定好调用Base的方法
   */
  Base2 *base = new Base2();
  Derived2 *derived = new Derived2("Derived2");
  Base2 *base2 = derived;
  Log(base->getName()); // Base2 expected & Base2
  Log(derived->getName());// Derived2 expected & Derived2
  Log(base2->getName());// Derived2 expected & Derived2
  /**
   * 因为被重写过，在运行时确定base2是Derived2的实例，在运行时运行Derived2的getName方法
   */
}