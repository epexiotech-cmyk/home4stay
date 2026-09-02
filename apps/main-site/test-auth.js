const { AuthService } = require('./src/lib/auth/auth.service');
async function test() {
  const auth = new AuthService();
  // bypass password and just generate token
  const user = await auth.userRepo.findByEmail('super_admin@home4stay.homes');
  console.log('Super Admin User:', user);
}
test();
