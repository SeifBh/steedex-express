<?php
/**
 * Created by PhpStorm.
 * User: Seif
 * Date: 21/07/2019
 * Time: 21:41
 */


namespace DemandeBundle\Enum;

abstract class DemandeTypeEnum
{
    const TYPE_Remise = "Remise";
    const TYPE_Achat = "Achat";
    const TYPE_Paiement = "Paiement";
    const TYPE_Retour = "Retour";

    /** @var array user friendly named type */
    protected static $typeName = [
        self::TYPE_Remise => 'Remise',
        self::TYPE_Achat => 'Achat',
        self::TYPE_Paiement => 'Paiement',
        self::TYPE_Retour => 'Retour',
    ];

    /**
     * @param  string $typeShortName
     * @return string
     */
    public static function getTypeName($typeShortName)
    {
        if (!isset(static::$typeName[$typeShortName])) {
            return "Unknown type ($typeShortName)";
        }

        return static::$typeName[$typeShortName];
    }

    /**
     * @return array<string>
     */
    public static function getAvailableTypes()
    {
        return [
            self::TYPE_Remise ,
            self::TYPE_Achat ,
            self::TYPE_Paiement ,
            self::TYPE_Retour
        ];
    }
}