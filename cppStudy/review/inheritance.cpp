#include "header.h"

struct Location {
  float x;
  float y;
};

class People {
  public:
    Location location;
    std::string name;
};

class Player : public People {
  public:
    int score;
};

int main () {

}