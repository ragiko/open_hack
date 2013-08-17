<?php
use Vg\Model\User;
use Vg\Model\Stretcher;

class UserTest extends PHPUnit_Framework_TestCase
{
    public function testUserのプロパティをセットできること()
    {
        $properties = [
            'id' => 2,
            'name' => 'test',
            'email' => 'test@example.com',
            'password' => 'password',
            'birthday' => '2013-07-07',
        ];

        $user = new User();
        $user->setProperties($properties);

        $this->assertEquals(2, $user->id, 'IDをセットできること');
        $this->assertEquals('test', $user->name, '名前をセットできること');
        $this->assertEquals('test@example.com', $user->email, 'メールアドレスをセットできること');
        $this->assertEquals('2013-07-07', $user->birthday, '誕生日をセットできること');
        $this->assertEquals(Stretcher::currentMethod(), $user->hash_method, 'ハッシュ方式をセットできること');
        $this->assertNotNull($user->password_hash, '生パスワードではなくストレッチングされたハッシュ値がセットされる');
    }

    public function test同じパスワードでもユーザ毎に異なるハッシュ値が生成されること()
    {
        $prop1 = [
            'email' => 'test1@example.com',
            'password' => 'password',
            'hash_method' => 'sha256_10000',
        ];
        $prop2 = [
            'email' => 'test2@example.com',
            'password' => 'password',
            'hash_method' => 'sha256_10000',
        ];
        $prop3 = [
            'email' => 'test2@example.com',
            'password' => 'password',
            'hash_method' => 'sha256_20000',
        ];

        $user1 = new User();
        $user1->setProperties($prop1);

        $user2 = new User();
        $user2->setProperties($prop2);

        $user3 = new User();
        $user3->setProperties($prop3);

        $this->assertEquals('feoUTZ56Qxo8/dOfj8Xtuu3aXOP3DG4T8aCMZ87yX0s=', $user1->password_hash, 'メアドが違えばパスワードが同じでも違うハッシュ値');
        $this->assertEquals('o7/iszOdqE6XiVQPtqP73uYPE65OMh0W5VkqBM2rrvA=', $user2->password_hash, 'メアドが違えばパスワードが同じでも違うハッシュ値');
        $this->assertEquals('J0pzdQbjV24p+yvWTS54zL0TUI+Fb5vmlAbAsEqXgac=', $user3->password_hash, 'ハッシュ方式が違えば違うハッシュ値');
    }

    public function testパスワードハッシュをセットできること()
    {
        $properties = [
            'password_hash' => 'hogehoge',
            'hash_method' => 'sha256_100',
        ];

        $user = new User();
        $user->setProperties($properties);

        $this->assertEquals('hogehoge', $user->password_hash, 'DBからの読み込み時はpassword_hashがそのままセットされる');
        $this->assertEquals('sha256_100', $user->hash_method, 'DBからの読み込み時はhash_methodがそのままセットされる');
    }

    public function testユーザー編集時に名前が空だとエラー文言がセットされること()
    {
        $input = [
            'name' => '',
            ];
        $validator = new Vg\Validator\UserEdit;
        $validator->validate($input);
        $errors = $validator->errors();
        $this->assertNotEquals('', $errors['name_notEmpty']);
    }

    public function testユーザー編集時に名前の長さが255文字はエラー文言がセットされないこと()
    {
        $input = [
            'name' => str_repeat('あ', 255),
            ];
        $validator = new Vg\Validator\UserEdit;
        $validator->validate($input);
        $errors = $validator->errors();
        $this->assertEquals('', $errors['name_length']);
    }

    public function testユーザー編集時に名前の長さが256文字はエラー文言がセットされること()
    {
        $input = [
            'name' => str_repeat('あ', 256),
            ];
        $validator = new Vg\Validator\UserEdit;
        $validator->validate($input);
        $errors = $validator->errors();
        $this->assertNotEquals('', $errors['name_length']);
    }

    public function testユーザー編集時にメールが空だとエラー文言がセットされること()
    {
        $input = [
            'email' => '',
            ];
        $validator = new Vg\Validator\UserEdit;
        $validator->validate($input);
        $errors = $validator->errors();
        $this->assertNotEquals('', $errors['mailaddress_notEmpty']);
    }

    public function testユーザー編集時にメールのアドレスが不正な場合はエラー文言がセットされること()
    {
        $validator = new Vg\Validator\UserEdit;

        $input = ['email' => 'aaa'];
        $validator->validate($input);
        $this->assertNotEquals('', $validator->errors()['mailaddress_email']);

        $input = ['email' => 'test@'];
        $validator->validate($input);
        $this->assertNotEquals('', $validator->errors()['mailaddress_email']);

        // 携帯キャリアでは有効とされるがRFC違反なアドレスはエラーとする
        $input = ['email' => 'test.@example.com'];
        $validator->validate($input);
        $this->assertNotEquals('', $validator->errors()['mailaddress_email']);

        // 携帯キャリアでは有効とされるがRFC違反なアドレスはエラーとする
        $input = ['email' => 'test..@example.com'];
        $validator->validate($input);
        $this->assertNotEquals('', $validator->errors()['mailaddress_email']);
    }

    public function testユーザー編集時にメールの長さが255文字はエラー文言がセットされないこと()
    {
        $input = [
            'email' => str_repeat('a', 255),
            ];
        $validator = new Vg\Validator\UserEdit;
        $validator->validate($input);
        $errors = $validator->errors();
        $this->assertEquals('', $errors['mailaddress_length']);
    }

    public function testユーザー編集時にメールの長さが256文字はエラー文言がセットされること()
    {
        $input = [
            'email' => str_repeat('a', 256),
            ];
        $validator = new Vg\Validator\UserEdit;
        $validator->validate($input);
        $errors = $validator->errors();
        $this->assertNotEquals('', $errors['mailaddress_length']);
    }

    public function testユーザー編集時に誕生日の書式がただしければエラー文言がセットされないこと()
    {
        $validator = new Vg\Validator\UserEdit;

        $input = ['birthday' => '2000-11-22'];
        $validator->validate($input);
        $this->assertEquals('', $validator->errors()['birthday_regex']);
    }

    public function testユーザー編集時に誕生日の書式がただしくなければエラー文言がセットされること()
    {
        $validator = new Vg\Validator\UserEdit;

        $input = ['birthday' => '00-11-22'];
        $validator->validate($input);
        $this->assertNotEquals('', $validator->errors()['birthday_regex']);

        $input = ['birthday' => '2012-111-22'];
        $validator->validate($input);
        $this->assertNotEquals('', $validator->errors()['birthday_regex']);

        $input = ['birthday' => '2012-11-222'];
        $validator->validate($input);
        $this->assertNotEquals('', $validator->errors()['birthday_regex']);
    }

    public function testプリフィックスがついたsaltを得る()
    {
        $this->assertEquals(User::SALT_PREFIX.'_user_id', User::generateSalt('_user_id'));
    }

    /**
     * @see https://github.com/VG-Tech-Dojo/GroupWorkBase/issues/44
     */
    public function test会員登録時に空POSTされた場合はバリデーションでエラーになること()
    {
        $validator = new Vg\Validator\UserRegister;

        $input = [];
        $this->assertFalse($validator->validate($input));
    }

    /**
     * @see https://github.com/VG-Tech-Dojo/GroupWorkBase/issues/44
     */
    public function test会員登録時に空POSTされた場合はバリデーションでエラー文言がセットされること()
    {
        $validator = new Vg\Validator\UserRegister;

        $input = [];
        $validator->validate($input);
        $errors = $validator->errors();

        $this->assertTrue(isset($errors['name']));
        $this->assertTrue(isset($errors['mailaddress']));
        $this->assertTrue(isset($errors['password']));
    }
}
