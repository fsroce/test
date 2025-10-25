#include <iostream>
#define LOG(val) std::cout << val << std::endl;

void incrementReference (int &val) {
  val++;
}
void incrementPointer (int *val) {
  (*val)++;
}
int main () {
  int a = 1;
  incrementReference(a);
  LOG(a);
  incrementPointer(&a);
  LOG(a);
}