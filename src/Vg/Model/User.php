<?php
namespace Vg\Model;

class User
{
    public $id;
    public $name;
    public $email;
    public $birthday;
    public $password_hash;
    public $hash_method;

    const SALT_PREFIX = 'ee837ba4e13ab88769ed27b93c089755710b004c0b6a71c8e194f350db24c81a';

    public function __construct()
    {
        $this->hash_method = Stretcher::currentMethod();
    }

    public function setProperties($data)
    {
        foreach (array('name', 'id', 'email', 'birthday') as $property) {
            $this->{$property} = (isset($data[$property]))? $data[$property]: "";
        }
        if ( isset($data['hash_method']) ) {
            $this->hash_method = $data['hash_method'];
        }
        if ( isset($data['password_hash']) ) {
            //DBからの読み込みの場合
            $this->password_hash = $data['password_hash'];
        } elseif ( isset($data['password']) ) {
            //フォームからの入力の場合
            $this->password_hash = $this->stretch($data['password']);
        }
    }

    public function stretch($password)
    {
        $s = Stretcher::create($this->hash_method);
        $salt = User::generateSalt($this->email);

        return $s->stretch($password, $salt);
    }

    public static function generateSalt($uniq)
    {
        return self::SALT_PREFIX . $uniq;
    }
}
