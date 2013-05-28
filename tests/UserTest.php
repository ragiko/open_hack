<?php
use Vg\Model\User;

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
        $this->assertEquals('password', $user->password, 'メールアドレスをセットできること');
        $this->assertEquals('2013-07-07', $user->birthday, '誕生日をセットできること');
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
}