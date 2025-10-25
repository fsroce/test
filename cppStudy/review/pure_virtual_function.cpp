#include "header.h"
/**
 * 纯虚函数
 * 允许我们在父类中声明一个函数，这个函数必须在子类中实现
 * 这样就不需要再父类中实现这个函数
 * 
 * 如果纯虚函数没有被实现，那么这个类将无法被实例化，这个类被称为 抽象类
 */
class Base {
public:
    // virtual && 函数等于0表示这个是一个纯虚函数
    virtual void print() = 0;
};

/**
 * 我们要实现一个Printable函数，要求打印出传入这个函数的类名
 * 可以先定义这样一个抽象类，所有的类都继承这个抽象类，然后实现这个抽象类中的printClassName()函数
 */
class Printable {
  public:
    virtual void printClassName() = 0;
};

class DerivedWithoutPrint : public Base {
public:
  void getName () {}
};

class DerivedWithPrint : public Base, public Printable {
public:
  void print () {
    Log("DerivedWithPrint::print()");
  }
  void printClassName () {
    Log("DerivedWithPrint");
  }
};
class DerivedWithPrint2 : public DerivedWithPrint {
public:
  void print () {
    Log("DerivedWithPrint2::print()");
  }
};

int main () {
  // Base *b = new Base();// Error Base是抽象类
  // DerivedWithoutPrint *d = new DerivedWithoutPrint();// Error 没有实现print，这也是个抽象类
  DerivedWithPrint *d = new DerivedWithPrint();
  d->print();
  d->printClassName();
  DerivedWithPrint2 *d2 = new DerivedWithPrint2();
  d2->print();
  d2->printClassName();// 输出DerivedWithPrint
}